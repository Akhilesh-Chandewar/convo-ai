"use server";

import { prisma } from "@/lib/databaseConnection";
import { getCurrentSession } from "@/lib/auth";

export const getCurrentUser = async () => {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
};
