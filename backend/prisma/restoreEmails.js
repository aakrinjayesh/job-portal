import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function restoreEmails() {
  try {
    // Example: update user with id = 1
    const updatedUser = await prisma.userProfile.update({
      where: { id: "4b3c76f4-1b94-4cb6-b2b2-10e3060ac802" },
      data: { email: 'prasad.dadi@aakrin.com' } // replace with the correct email
    });

    console.log('Email restored:', updatedUser);
  } catch (err) {
    console.error('Error updating email:', err);
  } finally {
    await prisma.$disconnect();
  }
}

restoreEmails();
