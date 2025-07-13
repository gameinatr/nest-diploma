# E-Shop Frontend

A modern e-commerce frontend application built with Next.js, React, and Tailwind CSS.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Product Catalog**: Browse products with search and filtering
- **Shopping Cart**: Add, update, and remove items from cart
- **Checkout Process**: Complete order placement with shipping information
- **User Profile**: View personal information and order history
- **Order Management**: Track order status and view order details
- **Responsive Design**: Mobile-friendly interface

## Pages

- **Home (/)**: Product listing with empty state
- **Login (/login)**: User authentication
- **Register (/register)**: User registration
- **Product Details (/products/[id])**: Single product view
- **Shopping Cart (/cart)**: Cart management
- **Checkout (/checkout)**: Order placement
- **Profile (/profile)**: User information and order history
- **Order Details (/orders/[id])**: Individual order view

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper
- **Authentication**: JWT tokens with refresh token support

## Prerequisites

- Node.js 18+ 
- npm or pnpm
- Backend API running on localhost:3000

## Installation

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

## API Integration

The frontend integrates with the backend API running on `localhost:3000` with the following endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile

### Products
- `GET /products` - Get products list
- `GET /products/:id` - Get single product

### Cart
- `GET /cart` - Get user cart
- `POST /cart/items` - Add item to cart
- `PATCH /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove cart item
- `DELETE /cart` - Clear cart

### Orders
- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get single order

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├���─ cart/              # Shopping cart page
│   ├── checkout/          # Checkout page
│   ├── login/             # Login page
│   ├── orders/            # Order pages
│   ├── products/          # Product pages
│   ├── profile/           # Profile page
│   ├── register/          # Registration page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── Loading.tsx        # Loading spinner
│   ├── Navigation.tsx     # Navigation bar
│   └── ProtectedRoute.tsx # Auth protection
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── CartContext.tsx    # Cart state
└── lib/                   # Utilities
    └── api.ts             # API client
```

## Features Details

### Authentication
- JWT-based authentication with refresh tokens
- Automatic token refresh on API calls
- Persistent login state with localStorage
- Protected routes for authenticated users

### Shopping Cart
- Add products to cart with quantity selection
- Update item quantities
- Remove individual items or clear entire cart
- Real-time cart count in navigation
- Cart persistence across sessions

### Order Management
- Complete checkout process with shipping information
- Order history with status tracking
- Detailed order views with item breakdown
- Order status indicators (pending, processing, shipped, delivered)

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interface
- Optimized for various screen sizes

## Environment Variables

The application uses the following configuration:

- **API Base URL**: `http://localhost:3000` (hardcoded in `lib/api.ts`)

To change the API URL, modify the `API_BASE_URL` constant in `src/lib/api.ts`.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Tailwind CSS for styling
- React hooks for state management

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

The application will be available at `http://localhost:3000`.

## API Error Handling

The application includes comprehensive error handling:
- Automatic token refresh on 401 errors
- User-friendly error messages
- Fallback to login page on authentication failures
- Retry mechanisms for failed requests

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of a diploma work and is for educational purposes.