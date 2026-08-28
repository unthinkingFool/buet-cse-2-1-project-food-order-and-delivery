import bcrypt from "bcryptjs"

const password = "Admin@12345";

bcrypt.hash(password, 12).then((hash) => {
  console.log(hash);
});