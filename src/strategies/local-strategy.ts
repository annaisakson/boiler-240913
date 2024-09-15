import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { pool } from "../index";

interface User {
  id: number;
  name: string;
  password: string;
  email: string;
}

declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      email: string;
    }
  }
}

// serializeUser används för att spara vår user id i vår session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

//deserializeUser använder vi för att hämta vårt user object från vår sparade session.
passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id]
    );
    const user = result.rows[0];
    console.log("deserilize user", user);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new LocalStrategy(
    { usernameField: "name", passwordField: "password" }, // specificera vilka fields vi använder
    async (name, password, done) => {
      try {
        const result = await pool.query(
          'SELECT * FROM "user" WHERE "name" = $1',
          [name]
        );
        console.log("localstrategy result", result.rows);

        const user = result.rows[0];

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        if (password !== user.password) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, {
          id: user.id,
          name: user.name,
          email: user.email,
        });
      } catch (error) {
        console.error("Error in LocalStrategy", error);
        return done(error);
      }
    }
  )
);

export default passport;
