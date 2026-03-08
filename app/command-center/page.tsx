import CommandCenterClient from "./client"

export const metadata = {
  title: "Command Center",
  description: "Weekly delivery snapshot and priority management",
}

export default function CommandCenterPage() {
  return <CommandCenterClient />
}
