import { prisma } from "./lib/db";
import { hashPin } from "./lib/auth";

async function verifyCloudDatabase() {
  console.log("==================================================");
  console.log("☁️  TESTING LIVE NEON CLOUD DATABASE CONNECTION");
  console.log("==================================================\n");

  const testUsername = `cloud_test_${Date.now()}`;
  const pinHash = await hashPin("1234");

  console.log(`1. Creating test user: @${testUsername} in Neon Cloud DB...`);
  const user = await prisma.user.create({
    data: {
      username: testUsername,
      pinHash,
      currency: "USD",
    },
  });
  console.log(`✅ User created with ID: ${user.id}`);

  console.log("\n2. Logging a test personal transaction in Neon Cloud DB...");
  const tx = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "EXPENSE",
      amount: 45.5,
      category: "Food & Dining",
      paymentMethod: "CARD",
      notes: "Cloud database live test",
    },
  });
  console.log(`✅ Transaction created with ID: ${tx.id} (Amount: $${tx.amount})`);

  console.log("\n3. Creating a test Trip Group: 'CO Fall 26 Live Test'...");
  const group = await prisma.tripGroup.create({
    data: {
      name: "CO Fall 26 Live Test",
      code: `CO-LIVE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      currency: "USD",
      totalBudget: 2500,
      createdById: user.id,
      members: {
        create: {
          userId: user.id,
          role: "ADMIN",
        },
      },
    },
    include: {
      members: true,
    },
  });
  console.log(`✅ Trip group created: ${group.name} (Code: ${group.code}) with ${group.members.length} member.`);

  console.log("\n4. Cleaning up test data from Neon Cloud DB...");
  await prisma.user.delete({ where: { id: user.id } });
  console.log("✅ Cleanup successful.");

  console.log("\n==================================================");
  console.log("🎉 NEON CLOUD POSTGRESQL IS 100% OPERATIONAL!");
  console.log("==================================================");
}

verifyCloudDatabase()
  .catch((err) => {
    console.error("❌ Cloud DB Test Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
