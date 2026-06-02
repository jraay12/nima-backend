import { prisma } from "./lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const hashedPassword = await bcrypt.hash("zR8!fK3@Vq1#Mx9$Tp7&Wn2L", 10);
  await prisma.user.create({
    data: {
      email: "administator@gmail.com",
      first_name: "Admin",
      last_name: "Admin",
      password: hashedPassword,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
