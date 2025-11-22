import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding countries & states...");

  await prisma.country.upsert({
    where: { name: "India" },
    update: {},
    create: {
      name: "India",
      code: "IN",
      states: {
        create: [
          { name: "Telangana", code: "TG" },
          { name: "Karnataka", code: "KA" },
          { name: "Maharashtra", code: "MH" },
          { name: "Delhi", code: "DL" },
        ],
      },
    },
  });

  await prisma.country.upsert({
    where: { name: "United States" },
    update: {},
    create: {
      name: "United States",
      code: "US",
      states: {
        create: [
          { name: "California", code: "CA" },
          { name: "Texas", code: "TX" },
          { name: "Florida", code: "FL" },
          { name: "New York", code: "NY" },
          { name: "Illinois", code: "IL" },
        ],
      },
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
