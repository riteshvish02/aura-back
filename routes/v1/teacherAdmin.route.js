const express = require("express");
const { Usercontroller ,scheduleController} = require("../../controllers");
const { userMiddleware, authMiddleware } = require("../../middlewares");

const router = express.Router();

router.get(
  "/info", 
  authMiddleware.isAuthenticated, 
  Usercontroller.info
);

router.post(
  "/login", 
  Usercontroller.login
);

router.post(
  "/register", 
  Usercontroller.register
);

router.post(
  "/update-user",
  authMiddleware.isAuthenticated,
  Usercontroller.updateUser
);

router.post(
  "/refresh-token", 
  Usercontroller.refreshToken
);

router.get(
  "/profile/:userId",
  authMiddleware.isAuthenticated,
  Usercontroller.getUserProfile
);

router.get(
  "/changepass/:userId",
  authMiddleware.isAuthenticated,
  Usercontroller.changePassword
);

router.get(
  "/user", 
  authMiddleware.isAuthenticated, 
  Usercontroller.getuser
);

router.get(
  "/admin/allusers",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("admin"),
  Usercontroller.getAllUsers
);

router.get(
  "/admin/userId",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("admin"),
  Usercontroller.deleteUser
);

router.route("/password/forgot").post(Usercontroller.forgotPassword);

router.post(
  "/reset-password/:userId",
  authMiddleware.isAuthenticated,
  Usercontroller.resetPassword
);


router.get('/teacher-schedule', authMiddleware.isAuthenticated, authMiddleware.authorizeRoles("teacher"), scheduleController.getTeacherWeeklySchedule);
// Mark QR as generated for a class session (held)
router.post(
  '/mark-qr-generated',
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles('teacher'),
  scheduleController.markQRGenerated
);
module.exports = router;
