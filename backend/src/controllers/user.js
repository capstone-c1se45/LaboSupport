import { users } from "../models/user.js";

// Lấy tất cả user
export const getUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    code: 200,
    message: "Fetched users successfully.",
    data: users,
  });
};

// Lấy 1 user theo id
export const getUserById = (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "User not found.",
    });
  }
  res.status(200).json({
    status: "success",
    code: 200,
    data: user,
  });
};

// Tạo user mới
export const createUser = (req, res) => {
  const { name, email } = req.body;
  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);
  res.status(201).json({
    status: "success",
    code: 201,
    message: "User created successfully.",
    data: newUser,
  });
};
