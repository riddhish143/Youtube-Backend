import { Router } from 'express';
import { loginUser, logOutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middleware/multer.middleware.js';
import { verfiyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.post(
  '/register',
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1
    },
    {
      name: 'coverImage',
      maxCount: 1
    }
  ]),
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.post(
  "/logout",
  verfiyJWT,
  logOutUser
);

// new way

router.route("/refresh-token").post(refreshAccessToken)
export default router;
