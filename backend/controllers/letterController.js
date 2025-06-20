import Letter from "../models/Letter.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CREATE LETTER
export const createLetter = async (req, res) => {
  try {
    console.log("Received letter data:", req.body);

    // Handle 'from' as array or string, filter out empty values
    let fromValue = req.body.from;
    if (Array.isArray(fromValue)) {
      fromValue = fromValue.find((val) => val && val.trim() !== "");
    }
    if (!fromValue || fromValue.trim() === "") {
      return res.status(400).json({ error: "Sender information is missing" });
    }

    // Find the sender user by name or email or ID
    const senderById = mongoose.Types.ObjectId.isValid(fromValue)
      ? await User.findById(fromValue)
      : null;
    const senderByName = await User.findOne({ name: fromValue });
    const senderByEmail = await User.findOne({ email: fromValue });

    console.log("Sender search results:", {
      byId: senderById,
      byName: senderByName,
      byEmail: senderByEmail,
    });

    const sender = senderById || senderByName || senderByEmail;

    if (!sender) {
      console.log("Sender not found:", fromValue);
      return res.status(404).json({ error: "Sender user not found" });
    }

    // Find the recipient user by name
    const recipient = await User.findOne({ name: req.body.to });
    if (!recipient) {
      console.log("Recipient not found:", req.body.to);
      return res.status(404).json({ error: "Recipient user not found" });
    }

    // Parse ccEmployees if it's a stringified object
    let ccEmployees = req.body.ccEmployees;
    console.log("Raw ccEmployees from request:", ccEmployees);
    console.log("Type of ccEmployees:", typeof ccEmployees);

    if (typeof ccEmployees === "string") {
      try {
        ccEmployees = JSON.parse(ccEmployees);
        console.log("Parsed ccEmployees:", ccEmployees);
      } catch (e) {
        console.error("Error parsing ccEmployees:", e);
        ccEmployees = {};
      }
    }
    if (
      typeof ccEmployees !== "object" ||
      ccEmployees === null ||
      Array.isArray(ccEmployees)
    ) {
      console.log("ccEmployees is not a valid object, setting to empty object");
      ccEmployees = {};
    }

    // Optionally, resolve CC emails if you want to send to CC departments/employees
    let ccEmails = [];
    if (Array.isArray(ccEmployees)) {
      ccEmails = ccEmployees;
      console.log("ccEmployees is array, using directly:", ccEmails);
    } else if (ccEmployees && typeof ccEmployees === "object") {
      console.log("Processing ccEmployees object:", ccEmployees);
      for (const dept in ccEmployees) {
        const names = ccEmployees[dept];
        console.log(`Processing department ${dept} with names:`, names);
        if (Array.isArray(names)) {
          const users = await User.find({ name: { $in: names } });
          console.log(
            `Found users for department ${dept}:`,
            users.map((u) => ({ name: u.name, email: u.email }))
          );
          ccEmails.push(...users.map((u) => u.email));
        }
      }
    }

    console.log("Final CC Emails resolved:", ccEmails);
    console.log("CC Employees data:", ccEmployees);

    // Handle file attachment for MongoDB storage
    let attachmentsArr = [];
    if (req.file) {
      attachmentsArr.push({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        data: req.file.buffer,
        uploadDate: new Date(),
      });
    }

    // Only include fields that exist in the schema (NO "reference" field)
    const isHighPriority =
      req.body.priority &&
      ["high", "urgent"].includes(req.body.priority.toLowerCase());
    const letterData = {
      subject: req.body.subject,
      from: sender._id,
      fromName: sender.name,
      fromEmail: sender.email,
      to: req.body.to,
      toEmail: recipient.email,
      department: req.body.department,
      priority: req.body.priority || "normal",
      content: req.body.content,
      attachments: attachmentsArr,
      cc: req.body.cc || [],
      ccEmployees: ccEmployees,
      unread: true,
      starred: false,
      status: isHighPriority ? "pending" : "sent",
    };

    const letter = new Letter(letterData);
    await letter.save();
    console.log("Letter saved to DB:", letter);

    if (isHighPriority) {
      // Do not send email, just notify admin (optional: create admin notification here)
      return res.status(201).json({
        message: "High/urgent priority letter pending admin approval.",
        letter,
      });
    }

    // Create notification for the main recipient
    const notification = new Notification({
      recipient: recipient._id,
      type: "new_letter",
      title: "New Letter Received",
      message: `You have received a new letter from ${sender.name} regarding "${req.body.subject}"`,
      relatedLetter: letter._id,
      priority: req.body.priority === "urgent" ? "high" : "medium",
    });
    await notification.save();

    // Create separate letter entries and notifications for CC recipients
    const ccLetters = [];
    const ccNotifications = [];

    for (const ccEmail of ccEmails) {
      try {
        // Find the CC user by email
        const ccUser = await User.findOne({ email: ccEmail });
        if (ccUser) {
          // Create a copy of the letter for the CC recipient
          const ccLetterData = {
            ...letterData,
            to: ccUser.name, // Change recipient to CC user
            toEmail: ccEmail,
            from: sender._id,
            fromName: sender.name,
            fromEmail: sender.email,
            isCC: true, // Mark as CC letter
            originalLetter: letter._id, // Reference to original letter
            unread: true,
            starred: false,
            status: "sent",
          };

          const ccLetter = new Letter(ccLetterData);
          await ccLetter.save();
          ccLetters.push(ccLetter);

          // Create notification for CC recipient
          const ccNotification = new Notification({
            recipient: ccUser._id,
            type: "new_letter",
            title: "Letter Copy Received (CC)",
            message: `You have received a copy of a letter from ${sender.name} regarding "${req.body.subject}"`,
            relatedLetter: ccLetter._id,
            priority: req.body.priority === "urgent" ? "high" : "medium",
          });
          await ccNotification.save();
          ccNotifications.push(ccNotification);

          console.log(
            `Created CC letter and notification for: ${ccUser.name} (${ccEmail})`
          );
        } else {
          console.log(`CC user not found for email: ${ccEmail}`);
        }
      } catch (error) {
        console.error(`Error creating CC letter for ${ccEmail}:`, error);
      }
    }

    console.log(
      `Created ${ccLetters.length} CC letters and ${ccNotifications.length} notifications`
    );

    // Send email to recipient and cc, with attachment if present
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enhanced headers to prevent forwarding and ensure confidentiality
    const emailHeaders = {
      "X-No-Forward": "true",
      "X-Confidential": "true",
      "X-Sensitivity": "Confidential",
      "X-Priority": req.body.priority === "urgent" ? "1" : "3",
      "X-MSMail-Priority": req.body.priority === "urgent" ? "High" : "Normal",
      Importance: req.body.priority === "urgent" ? "high" : "normal",
      "Disposition-Notification-To": sender.email,
      "Return-Receipt-To": sender.email,
      "X-Confirm-Reading-To": sender.email,
      "X-Mailer": "Letter Management System - Confidential",
    };

    // Create confidentiality notice for CC recipients
    const confidentialityNotice = `
CONFIDENTIAL COMMUNICATION - DO NOT FORWARD

This email contains confidential information intended only for the named recipient(s). 
If you are not the intended recipient, please delete this email immediately and notify the sender.

FORWARDING RESTRICTIONS:
- This email may not be forwarded to any other party without explicit written permission
- Do not copy, distribute, or share the contents of this email
- Any unauthorized disclosure may result in disciplinary action

By receiving this email, you acknowledge that you understand and will comply with these confidentiality requirements.
    `;

    const mailOptions = {
      from: `"${sender.name} (${req.body.department})" <${sender.email}>`,
      to: recipient.email,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      subject: `[CONFIDENTIAL] ${req.body.subject}`,
      headers: emailHeaders,
      text:
        `${confidentialityNotice}\n\n` +
        `From: ${sender.name} <${sender.email}>\n` +
        `Department: ${req.body.department}\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `Priority: ${req.body.priority.toUpperCase()}\n\n` +
        `Subject: ${req.body.subject}\n\n` +
        `${req.body.content}\n\n` +
        `---\n` +
        `${confidentialityNotice}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc3545; border-radius: 8px; padding: 20px;">
        <div style="background-color: #dc3545; color: white; padding: 15px; margin: -20px -20px 20px -20px; border-radius: 6px 6px 0 0; text-align: center;">
          <strong style="font-size: 16px;">⚠️ CONFIDENTIAL COMMUNICATION - DO NOT FORWARD ⚠️</strong>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 12px; margin-bottom: 20px; border-radius: 5px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>CONFIDENTIALITY NOTICE:</strong> This email contains confidential information intended only for the named recipient(s). 
            Forwarding, copying, or distributing this email without explicit permission is strictly prohibited.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #007bff;">
          <p style="margin: 5px 0;"><strong>From:</strong> ${sender.name} &lt;${
        sender.email
      }&gt;</p>
          <p style="margin: 5px 0;"><strong>Department:</strong> ${
            req.body.department
          }</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: ${
            req.body.priority === "urgent"
              ? "#dc3545"
              : req.body.priority === "high"
              ? "#fd7e14"
              : "#28a745"
          }; font-weight: bold;">${req.body.priority.toUpperCase()}</span></p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${
            req.body.subject
          }</p>
          ${
            ccEmails.length > 0
              ? `<p style="margin: 5px 0;"><strong>CC:</strong> ${ccEmails.join(
                  ", "
                )}</p>`
              : ""
          }
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; margin-bottom: 20px;">
          <p style="line-height: 1.6; color: #333; margin: 0;">${req.body.content.replace(
            /\n/g,
            "<br>"
          )}</p>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; font-size: 12px; color: #6c757d; border-left: 4px solid #dc3545;">
          <p style="margin: 0 0 10px 0;"><strong>CONFIDENTIALITY REQUIREMENTS:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Do not forward this email without explicit written permission</li>
            <li>Do not copy or distribute the contents</li>
            <li>Maintain the confidentiality of all information contained herein</li>
            <li>Any unauthorized disclosure may result in disciplinary action</li>
          </ul>
          <p style="margin: 10px 0 0 0; font-style: italic;">
            By receiving this email, you acknowledge that you understand and will comply with these confidentiality requirements.
          </p>
        </div>
      </div>
    `,
      attachments: req.file
        ? [
            {
              filename: req.file.originalname,
              content: req.file.buffer,
            },
          ]
        : [],
    };

    console.log("Sending email with CC:", ccEmails);
    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", recipient.email, "CC:", ccEmails);

    res.status(201).json({ message: "Letter created and emailed", letter });
  } catch (error) {
    console.error("Error in createLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET ALL LETTERS
export const getLetters = async (req, res) => {
  try {
    // Get user email from query parameter or headers
    const userEmail = req.query.userEmail || req.headers["user-email"];
    const fetchAll = req.query.all === "true";

    if (!userEmail) {
      return res.status(400).json({ error: "User email is required" });
    }

    // Find the user to check their role
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (fetchAll && user.role === "admin") {
      // Admin requests all letters
      const letters = await Letter.find({}).sort({ createdAt: -1 });
      console.log(`Admin ${userEmail} fetched ALL letters: ${letters.length}`);
      return res.status(200).json(letters);
    }

    console.log("Fetching letters for user:", userEmail);
    // Find letters where the user is either the recipient or a CC recipient
    const letters = await Letter.find({
      $or: [
        { toEmail: userEmail }, // Direct recipient
        { isCC: true, toEmail: userEmail }, // CC recipient
      ],
    }).sort({ createdAt: -1 });

    console.log(`Found ${letters.length} letters for user ${userEmail}`);
    res.status(200).json(letters);
  } catch (error) {
    console.error("Error in getLetters:", error);
    res.status(500).json({ error: error.message });
  }
};

// FILE DOWNLOAD
export const downloadFile = async (req, res) => {
  try {
    const { letterId, filename } = req.params;

    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }

    const attachment = letter.attachments.find(
      (att) => att.filename === filename
    );

    if (!attachment) {
      return res.status(404).json({ error: "File not found" });
    }

    res.setHeader("Content-Type", attachment.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${attachment.filename}"`
    );
    res.send(attachment.data);
  } catch (error) {
    console.error("Error in downloadFile:", error);
    res.status(500).json({ error: error.message });
  }
};

// FILE VIEW
export const viewFile = async (req, res) => {
  try {
    const { letterId, filename } = req.params;

    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }

    const attachment = letter.attachments.find(
      (att) => att.filename === filename
    );

    if (!attachment) {
      return res.status(404).json({ error: "File not found" });
    }

    res.setHeader("Content-Type", attachment.contentType);
    res.setHeader("Content-Disposition", "inline");
    res.send(attachment.data);
  } catch (error) {
    console.error("Error in viewFile:", error);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE LETTER STATUS
export const updateLetterStatus = async (req, res) => {
  try {
    const { letterId, unread, starred, status } = req.body;

    const updateFields = {};
    if (unread !== undefined) updateFields.unread = unread;
    if (starred !== undefined) updateFields.starred = starred;
    if (status !== undefined) updateFields.status = status;

    const updatedLetter = await Letter.findByIdAndUpdate(
      letterId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedLetter) {
      return res.status(404).json({ message: "Letter not found" });
    }

    // Create notification for letter status changes
    if (unread === false) {
      const notification = new Notification({
        recipient: updatedLetter.from,
        type: "letter_read",
        title: "Letter Read",
        message: `${updatedLetter.to} has read your letter regarding "${updatedLetter.subject}"`,
        relatedLetter: updatedLetter._id,
        priority: "low",
      });
      await notification.save();
    }

    if (starred === true) {
      const notification = new Notification({
        recipient: updatedLetter.from,
        type: "letter_starred",
        title: "Letter Starred",
        message: `${updatedLetter.to} has starred your letter regarding "${updatedLetter.subject}"`,
        relatedLetter: updatedLetter._id,
        priority: "low",
      });
      await notification.save();
    }

    res.json(updatedLetter);
  } catch (error) {
    console.error("Error updating letter status:", error);
    res.status(500).json({ message: "Error updating letter status" });
  }
};

// GET SENT LETTERS
export const getSentLetters = async (req, res) => {
  try {
    // Get user email from query parameter or headers
    const userEmail = req.query.userEmail || req.headers["user-email"];

    if (!userEmail) {
      return res.status(400).json({ error: "User email is required" });
    }

    // Filter letters by the current user's email and sent status
    const sentLetters = await Letter.find({
      fromEmail: userEmail,
      status: "sent",
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(sentLetters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE LETTER
export const deleteLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLetter = await Letter.findByIdAndDelete(id);

    if (!deletedLetter) {
      return res.status(404).json({ message: "Letter not found" });
    }

    res.status(200).json({ message: "Letter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting letter", error });
  }
};

// ADMIN: Approve a pending letter and send it
export const approveLetter = async (req, res) => {
  try {
    const { letterId } = req.body;
    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }
    if (letter.status !== "pending") {
      return res.status(400).json({ error: "Letter is not pending approval" });
    }

    // Find sender and recipient
    const sender = await User.findById(letter.from);
    const recipient = await User.findOne({ name: letter.to });
    if (!sender || !recipient) {
      return res.status(404).json({ error: "Sender or recipient not found" });
    }

    // Optionally, resolve CC emails
    let ccEmails = [];
    if (Array.isArray(letter.ccEmployees)) {
      ccEmails = letter.ccEmployees;
    } else if (letter.ccEmployees && typeof letter.ccEmployees === "object") {
      for (const dept in letter.ccEmployees) {
        const names = letter.ccEmployees[dept];
        if (Array.isArray(names)) {
          const users = await User.find({ name: { $in: names } });
          ccEmails.push(...users.map((u) => u.email));
        }
      }
    }

    console.log("CC Emails resolved (approve):", ccEmails);

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enhanced headers to prevent forwarding and ensure confidentiality
    const emailHeaders = {
      "X-No-Forward": "true",
      "X-Confidential": "true",
      "X-Sensitivity": "Confidential",
      "X-Priority": letter.priority === "urgent" ? "1" : "3",
      "X-MSMail-Priority": letter.priority === "urgent" ? "High" : "Normal",
      Importance: letter.priority === "urgent" ? "high" : "normal",
      "Disposition-Notification-To": sender.email,
      "Return-Receipt-To": sender.email,
      "X-Confirm-Reading-To": sender.email,
      "X-Mailer": "Letter Management System - Confidential",
    };

    // Create confidentiality notice for CC recipients
    const confidentialityNotice = `
CONFIDENTIAL COMMUNICATION - DO NOT FORWARD

This email contains confidential information intended only for the named recipient(s). 
If you are not the intended recipient, please delete this email immediately and notify the sender.

FORWARDING RESTRICTIONS:
- This email may not be forwarded to any other party without explicit written permission
- Do not copy, distribute, or share the contents of this email
- Any unauthorized disclosure may result in disciplinary action

By receiving this email, you acknowledge that you understand and will comply with these confidentiality requirements.
    `;

    const mailOptions = {
      from: `"${sender.name} (${letter.department})" <${sender.email}>`,
      to: recipient.email,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      subject: `[CONFIDENTIAL] ${letter.subject}`,
      headers: emailHeaders,
      text:
        `${confidentialityNotice}\n\n` +
        `From: ${sender.name} <${sender.email}>\n` +
        `Department: ${letter.department}\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `Priority: ${letter.priority.toUpperCase()}\n\n` +
        `Subject: ${letter.subject}\n\n` +
        `${letter.content}\n\n` +
        `---\n` +
        `${confidentialityNotice}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc3545; border-radius: 8px; padding: 20px;">
        <div style="background-color: #dc3545; color: white; padding: 15px; margin: -20px -20px 20px -20px; border-radius: 6px 6px 0 0; text-align: center;">
          <strong style="font-size: 16px;">⚠️ CONFIDENTIAL COMMUNICATION - DO NOT FORWARD ⚠️</strong>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 12px; margin-bottom: 20px; border-radius: 5px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>CONFIDENTIALITY NOTICE:</strong> This email contains confidential information intended only for the named recipient(s). 
            Forwarding, copying, or distributing this email without explicit permission is strictly prohibited.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #007bff;">
          <p style="margin: 5px 0;"><strong>From:</strong> ${sender.name} &lt;${
        sender.email
      }&gt;</p>
          <p style="margin: 5px 0;"><strong>Department:</strong> ${
            letter.department
          }</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: ${
            letter.priority === "urgent"
              ? "#dc3545"
              : letter.priority === "high"
              ? "#fd7e14"
              : "#28a745"
          }; font-weight: bold;">${letter.priority.toUpperCase()}</span></p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${
            letter.subject
          }</p>
          ${
            ccEmails.length > 0
              ? `<p style="margin: 5px 0;"><strong>CC:</strong> ${ccEmails.join(
                  ", "
                )}</p>`
              : ""
          }
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; margin-bottom: 20px;">
          <p style="line-height: 1.6; color: #333; margin: 0;">${letter.content.replace(
            /\n/g,
            "<br>"
          )}</p>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; font-size: 12px; color: #6c757d; border-left: 4px solid #dc3545;">
          <p style="margin: 0 0 10px 0;"><strong>CONFIDENTIALITY REQUIREMENTS:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Do not forward this email without explicit written permission</li>
            <li>Do not copy or distribute the contents</li>
            <li>Maintain the confidentiality of all information contained herein</li>
            <li>Any unauthorized disclosure may result in disciplinary action</li>
          </ul>
          <p style="margin: 10px 0 0 0; font-style: italic;">
            By receiving this email, you acknowledge that you understand and will comply with these confidentiality requirements.
          </p>
        </div>
      </div>
    `,
      attachments:
        letter.attachments && letter.attachments.length > 0
          ? letter.attachments.map((att) => ({
              filename: att.filename,
              content: att.data,
            }))
          : [],
    };

    console.log("Sending approved email with CC:", ccEmails);
    await transporter.sendMail(mailOptions);
    console.log("Approved email sent to:", recipient.email, "CC:", ccEmails);

    letter.status = "sent";
    await letter.save();

    // Create notification for the recipient
    const notification = new Notification({
      recipient: recipient._id,
      type: "new_letter",
      title: "New Letter Received",
      message: `You have received a new letter from ${sender.name} regarding "${letter.subject}"`,
      relatedLetter: letter._id,
      priority: letter.priority === "urgent" ? "high" : "medium",
    });
    await notification.save();

    res.status(200).json({ message: "Letter approved and sent", letter });
  } catch (error) {
    console.error("Error in approveLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET ALL PENDING LETTERS (for admin)
export const getPendingLetters = async (req, res) => {
  try {
    const pendingLetters = await Letter.find({ status: "pending" }).sort({
      createdAt: -1,
    });
    res.status(200).json(pendingLetters);
  } catch (error) {
    console.error("Error in getPendingLetters:", error);
    res.status(500).json({ error: error.message });
  }
};
