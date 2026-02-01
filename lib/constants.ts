// Route paths and application constants
export const ROUTES = {
  // Auth routes
  LOGIN: "/login",

  // Dashboard routes
  DASHBOARD: "/",
  USERS: "/users",
  USER_DETAIL: (id: string) => `/users/${id}`,
  MERCHANTS: "/merchants",
  TRANSACTIONS: "/transactions",
  FOREX: "/forex",
  BANKING: "/banking",
  BLOCKCHAIN: "/blockchain",
  COMPLIANCE: "/compliance",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  REPORTS: "/reports",
} as const

// Navigation menu structure
export const NAV_GROUPS = {
  overview: {
    title: "Overview",
    items: [{ title: "Dashboard", href: ROUTES.DASHBOARD, icon: "LayoutDashboard" }],
  },
  usersAccounts: {
    title: "Users & Accounts",
    items: [
      { title: "Customers", href: ROUTES.USERS, icon: "Users" },
      { title: "Merchants", href: ROUTES.MERCHANTS, icon: "Store" },
    ],
  },
  finance: {
    title: "Transactions & Finance",
    items: [
      { title: "Transactions", href: ROUTES.TRANSACTIONS, icon: "ArrowLeftRight" },
      { title: "Forex Rates", href: ROUTES.FOREX, icon: "DollarSign" },
      { title: "Banking", href: ROUTES.BANKING, icon: "Building2" },
    ],
  },
  systemTools: {
    title: "System & Tools",
    items: [
      { title: "Blockchain", href: ROUTES.BLOCKCHAIN, icon: "Box" },
      { title: "Notifications", href: ROUTES.NOTIFICATIONS, icon: "Bell" },
      { title: "Settings", href: ROUTES.SETTINGS, icon: "Settings" },
    ],
  },
  complianceReports: {
    title: "Compliance & Reports",
    items: [
      { title: "Compliance", href: ROUTES.COMPLIANCE, icon: "ShieldCheck" },
      { title: "Reports", href: ROUTES.REPORTS, icon: "BarChart3" },
    ],
  },
}

export const API_BASE = typeof window === 'undefined'
  ? (process.env.GATEWAY_INTERNAL_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://127.0.0.1:9000') + '/api/v1'
  : '/api/v1';
