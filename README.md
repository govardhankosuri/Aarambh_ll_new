# Aarambh

Project files are split by responsibility:

- `frontend/` contains the HTML, CSS, JavaScript, logo, and image assets.
- `backend/` contains the Spring Boot API, Maven wrapper, configuration, and database resources.

The project is designed so source files do not rewrite themselves. Local machine files, IDE files, Maven build output, and local database files are ignored by Git through `.gitignore`.

Run the backend from `backend/`:

```sh
mvn spring-boot:run
```

Open the frontend from `frontend/index.html` or serve the `frontend/` folder with a local static server.

For backend features that send email or create Razorpay orders, set these environment variables on the machine running the backend:

```sh
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-app-password
APP_MAIL_ADMIN_TO=admin@example.com
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

Optional database overrides:

```sh
DB_URL=jdbc:mysql://localhost:3306/aarambh_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
DB_USERNAME=root
DB_PASSWORD=root
```
