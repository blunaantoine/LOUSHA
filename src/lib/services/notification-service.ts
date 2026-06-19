import { db } from "@/lib/db";

export async function listActiveNotifications() {
  return db.notification.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function listAllNotifications() {
  return db.notification.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createNotification(input: {
  title: string;
  titleEn?: string;
  message: string;
  messageEn?: string;
  type?: string;
}) {
  return db.notification.create({
    data: {
      title: input.title,
      titleEn: input.titleEn || "",
      message: input.message,
      messageEn: input.messageEn || "",
      type: input.type || "info",
    },
  });
}

export async function deleteNotification(id: string) {
  return db.notification.delete({ where: { id } });
}

export async function toggleNotification(id: string, active: boolean) {
  return db.notification.update({ where: { id }, data: { active } });
}
