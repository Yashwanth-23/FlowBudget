import { prisma } from "./lib/db";

async function cleanExistingGroupCodes() {
  const groups = await prisma.tripGroup.findMany();
  console.log(`Found ${groups.length} groups in database:`);

  for (const g of groups) {
    const cleanedCode = g.code.replace(/-+/g, "-");
    if (cleanedCode !== g.code) {
      console.log(`Updating group "${g.name}" code: "${g.code}" ➔ "${cleanedCode}"`);
      await prisma.tripGroup.update({
        where: { id: g.id },
        data: { code: cleanedCode },
      });
    } else {
      console.log(`Group "${g.name}" code is already clean: "${g.code}"`);
    }
  }

  console.log("Done.");
}

cleanExistingGroupCodes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
