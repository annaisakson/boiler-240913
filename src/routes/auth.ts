import { Router } from "express";
import passport from "passport";

const router = Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: any, user: Express.User | false) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ message: "Invalid username or password" });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({
        message: "Logged in succesfully",
        user: { id: user.id, name: user.name },
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  if (!req.isAuthenticated) return res.sendStatus(401);
  req.logout((err) => {
    if (err) return res.sendStatus(400);
    res.send(200);
  });
});

export default router;
