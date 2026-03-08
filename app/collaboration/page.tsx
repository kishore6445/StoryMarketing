"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ActivityFeed } from "@/components/activity-feed"
import { TaskComments } from "@/components/task-comments"
import { TeamMentions } from "@/components/team-mentions"
import { Users, MessageSquare, Zap } from "lucide-react"

export default function CollaborationPage() {
  const [activeTab, setActiveTab] = useState<"activity" | "comments" | "team">("activity")

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#F8F9FB]">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#1D1D1F]">Team Collaboration</h1>
          <p className="text-[#515154]">
            Stay connected with your team through real-time activity feeds, comments, and mentions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#E5E5E7]">
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "activity"
                ? "border-[#007AFF] text-[#007AFF]"
                : "border-transparent text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Activity Feed
            </div>
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "comments"
                ? "border-[#007AFF] text-[#007AFF]"
                : "border-transparent text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Task Comments
            </div>
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "team"
                ? "border-[#007AFF] text-[#007AFF]"
                : "border-transparent text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Mentions
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === "activity" && (
            <div>
              <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Recent Activity</h2>
              <ActivityFeed limit={15} />
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">
                Comments on Active Tasks
              </h2>

              {/* Task 1 */}
              <TaskComments
                taskId="task-1"
                taskTitle="Review LinkedIn posting times for optimal engagement"
                initialComments={[
                  {
                    id: "c1",
                    author: "Alex",
                    text: "Found peak engagement times are 8-10 AM EST and 12-1 PM EST on weekdays",
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                  },
                  {
                    id: "c2",
                    author: "Jordan",
                    text: "Great insights! Should we adjust the publishing schedule accordingly?",
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                  },
                ]}
              />

              {/* Task 2 */}
              <TaskComments
                taskId="task-2"
                taskTitle="Create monthly report for client review"
                initialComments={[
                  {
                    id: "c3",
                    author: "Soujanya",
                    text: "Working on the analytics section - should have it ready by EOD",
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                  },
                ]}
              />

              {/* Task 3 */}
              <TaskComments
                taskId="task-3"
                taskTitle="Prepare brand guidelines presentation"
                initialComments={[]}
              />
            </div>
          )}

          {activeTab === "team" && (
            <Card className="p-6 border border-[#E5E5E7]">
              <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Mention Team Members</h2>
              <p className="text-sm text-[#515154] mb-4">
                Use @ to mention team members in comments, tasks, or documents
              </p>

              <div className="bg-[#F8F9FB] p-4 rounded-lg border border-[#E5E5E7]">
                <label className="block text-sm font-medium text-[#1D1D1F] mb-3">
                  Message
                </label>
                <TeamMentions placeholder="Type @ to mention someone..." />

                <div className="mt-4">
                  <textarea
                    placeholder="Write your message here..."
                    className="w-full text-sm bg-white border border-[#E5E5E7] rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#007AFF] resize-none"
                    rows={4}
                  />
                </div>

                <Button className="mt-4 w-full bg-[#007AFF] hover:bg-[#0056CC] text-white">
                  Send Message
                </Button>
              </div>

              {/* Team Members Grid */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#1D1D1F] mb-3">Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {["Ravi", "Soujanya", "Alex", "Sarah", "Jordan"].map((member) => (
                    <div
                      key={member}
                      className="flex items-center gap-3 p-3 bg-[#F8F9FB] rounded-lg border border-[#E5E5E7]"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#007AFF] flex items-center justify-center text-white font-semibold">
                        {member[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1D1D1F]">{member}</p>
                        <p className="text-xs text-[#86868B]">Active now</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[#34C759]" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Collaboration Tips */}
        <Card className="p-6 border border-[#E5E5E7] bg-[#F5F5F7]">
          <h3 className="font-semibold text-[#1D1D1F] mb-2">Collaboration Best Practices</h3>
          <ul className="space-y-2 text-sm text-[#515154]">
            <li>• Use @mentions to notify specific team members about urgent updates</li>
            <li>• Add comments on tasks to provide feedback and maintain communication history</li>
            <li>• Check the activity feed regularly to stay updated on team progress</li>
            <li>• Attach relevant documents and files when creating new phases or tasks</li>
          </ul>
          </Card>
        </div>
      </main>
    </AuthGuard>
  )
}
