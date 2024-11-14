import 'reflect-metadata';
import express from 'express';
import { DataSource, Repository } from 'typeorm';
import { User } from './entity/User';
import { Post } from './entity/Post';

const app = express();
app.use(express.json());

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "test_db",
  entities: [User,Post],
  synchronize: true,
});

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initializeDatabase = async () => {
  await wait(20000);
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    process.exit(1);
  }
};

initializeDatabase();

app.post("/users", async (req, res) => {
  const {id, firstName, lastName, email} = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: firstName, lastName, email",
    });
  }

  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  const user: User = new User();
  user.id = id;
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;

  try {
    const savedUser = await userRepository.save(user);

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        user: {
          id: savedUser.id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
        },
      },
    });
  } catch (e: any) {
    console.error("Error saving user:", e);

    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      details: e.message || " An unexpected error ocurred",
    });
  }

});

app.post("/posts", async (req, res) => {
  const {id, title, description, userId} = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: title, description, userId",
    });
  }

  const postRepository: Repository<Post> = AppDataSource.getRepository(Post);
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  try {
    const user: User | null = await userRepository.findOneBy({id: userId});

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Internal Server Error",
        details: "User not found",
      });
    }

    const post: Post = new Post();
    post.id = id;
    post.title = title;
    post.description = description;
    post.user = user;

    const savedPost = await postRepository.save(post);

    res.status(201).json({
      status: "success",
      message: "Post created successfully",
      data: {
        post: {
          id: savedPost.id,
          title: savedPost.title,
          description: savedPost.description,
          user: savedPost.user.id,
        },
      },
    });
  } catch (e: any) {
    console.error("Error saving post:", e);

    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      details: e.message || " An unexpected error ocurred",
    });
  }


});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
