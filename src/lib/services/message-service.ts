/**
 * Service Messages & Newsletter — gestion des messages contact et abonnés.
 */
import { db } from "@/lib/db";

/* ============ Messages de contact ============ */

export async function createContactMessage(name: string, email: string, message: string) {
  return db.contactMessage.create({
    data: { name, email, message },
  });
}

export async function listContactMessages() {
  return db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function markMessageRead(id: string, read: boolean) {
  return db.contactMessage.update({ where: { id }, data: { read } });
}

export async function replyToMessage(id: string, reply: string) {
  return db.contactMessage.update({
    where: { id },
    data: { replied: true, reply },
  });
}

export async function deleteMessage(id: string) {
  return db.contactMessage.delete({ where: { id } });
}

export async function getMessage(id: string) {
  return db.contactMessage.findUnique({ where: { id } });
}

/* ============ Newsletter ============ */

export async function subscribeNewsletter(email: string) {
  return db.newsletterSubscriber.upsert({
    where: { email: email.toLowerCase() },
    update: { active: true },
    create: { email: email.toLowerCase(), active: true },
  });
}

export async function listNewsletterSubscribers() {
  return db.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteSubscriber(id: string) {
  return db.newsletterSubscriber.delete({ where: { id } });
}
