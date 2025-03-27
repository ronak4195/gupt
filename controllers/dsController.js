import DS from "../model/ds.js";
import SKS from "../model/sks.js";
import { sskGen } from "../utils/sskGen.js";
import { xorDecrypt, xorEncrypt } from "../utils/xorEncrypt.js";

export const sendMessage = async (req, res) => {
  try {
    console.log(req.body);
    const { userId, kutumbId, password, domain, message } = req.body;
    const user = await SKS.findOne({ userId });
    if (!user)
      return res.status(404).json({
        status: "Fail",
        message: "Users must be friends to send message",
      });
    const cipherTextA = user.cipherText;
    if (!cipherTextA)
      return res.status(404).json({
        status: "Fail",
        message: "Users must be friends to send message",
      });
    const sskA = await sskGen(password, userId, domain);
    const skkB2A = xorDecrypt(cipherTextA, sskA);
    const encryptedMessage = xorEncrypt(message, skkB2A);
    const dsEntity =
      (await DS.findOne({ userId: kutumbId })) ||
      new DS({ userId: kutumbId, message: [] });
    dsEntity.message.push({ sender: userId, data: encryptedMessage });
    await dsEntity.save();
    res.status(201).json({
      status: "Success",
      message: "Message is successfully encrypted",
    });
  } catch (e) {
    res.status(500).json({ status: "Fail", message: e });
  }
};

export const receiveMessage = async (req, res) => {
  try {
    const { userId, password, domain, sender } = req.body;
    const user = await DS.findOne({ userId });

    if (!user) {
      return res.status(404).json({ status: "Fail", message: "No such user!" });
    }

    let messages = [];
    for (const msg of user.message) {
      const kutumb = msg.sender;
      const skkB2A = await sskGen(password, kutumb, domain);
      const decryptedMessage = xorDecrypt(msg.data, skkB2A);
      messages.push({ sender: kutumb, data: decryptedMessage });
    }
    messages = messages.filter((msg) => msg.sender === sender);
    res.status(200).json({ status: "Success", messages: messages });
  } catch (e) {
    res.status(500).json({ status: "Fail", message: e });
  }
};
