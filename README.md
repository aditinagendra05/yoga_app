# Yoga Master – Backend API

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev
```

---

## Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/token` | — | Generate JWT. Body: `{ email }` |

---

## Users
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/users` | — | Create user |
| GET | `/users` | JWT + Admin | All users |
| GET | `/users/email/:email` | JWT | User by email |
| GET | `/users/:id` | — | User by ID |
| PUT | `/users/:id` | JWT + Admin | Update user |
| DELETE | `/users/:id` | JWT + Admin | Delete user |

---

## Classes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/classes` | — | All approved classes |
| GET | `/classes/popular` | — | Top 6 by enrollment |
| GET | `/classes/manage` | JWT + Admin | All classes (any status) |
| GET | `/classes/instructor/:email` | JWT + Instructor | Classes by instructor |
| GET | `/classes/:id` | — | Single class |
| POST | `/classes` | JWT + Instructor | Create class |
| PUT | `/classes/:id` | JWT + Instructor | Update class |
| PATCH | `/classes/:id/status` | JWT + Admin | Approve/deny class. Body: `{ status, reason? }` |

---

## Cart
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/cart/:email` | JWT | User's cart (full class objects) |
| GET | `/cart/check/:classId?email=` | JWT | Check if class is in cart |
| POST | `/cart` | JWT | Add to cart. Body: `{ classId, userMail }` |
| DELETE | `/cart/:classId?email=` | JWT | Remove from cart |

---

## Payments
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/payments/create-intent` | JWT | Create Stripe PaymentIntent. Body: `{ price }` |
| POST | `/payments` | JWT | Record payment + enroll + clear cart |
| GET | `/payments/:email` | JWT | Payment history |
| GET | `/payments/:email/count` | JWT | Payment count |

---

## Enrolled
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/enrolled/:email` | JWT | Enrolled classes with instructor info |

---

## Instructors
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/instructors` | — | All instructors |
| GET | `/instructors/popular` | — | Top 6 by enrollments |
| GET | `/instructors/admin-stats` | JWT + Admin | Dashboard stats |
| POST | `/instructors/apply` | — | Apply to become instructor |
| GET | `/instructors/apply/:email` | — | Check application status |