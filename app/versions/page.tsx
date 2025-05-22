"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Clock, Code, Download, FileText, Star } from "lucide-react"

// Define version history data
const versionHistory = [
  {
    version: "v1.0.0",
    date: "2023-01-15",
    type: "major",
    title: "Initial Release",
    description: "First stable release of KinderChef with basic meal tracking and inventory management.",
    changes: [
      "Basic user authentication",
      "Meal tracking functionality",
      "Inventory management",
      "Dashboard with key metrics",
    ],
  },
  {
    version: "v1.1.0",
    date: "2023-02-01",
    type: "minor",
    title: "UI Improvements",
    description: "Enhanced user interface and experience.",
    changes: [
      "Redesigned dashboard",
      "Improved navigation",
      "Added dark mode support",
      "Enhanced mobile responsiveness",
    ],
  },
  {
    version: "v1.1.1",
    date: "2023-02-15",
    type: "patch",
    title: "Bug Fixes",
    description: "Fixed various bugs and improved stability.",
    changes: ["Fixed login issues", "Corrected inventory calculation errors", "Improved error handling"],
  },
  {
    version: "v1.2.0",
    date: "2023-03-10",
    type: "minor",
    title: "Reporting Features",
    description: "Added comprehensive reporting capabilities.",
    changes: [
      "Monthly usage reports",
      "Inventory status reports",
      "Meal serving statistics",
      "Export to CSV functionality",
    ],
  },
  {
    version: "v1.2.1",
    date: "2023-03-25",
    type: "patch",
    title: "Performance Optimization",
    description: "Improved system performance and reduced loading times.",
    changes: ["Optimized database queries", "Improved caching", "Reduced API response times"],
  },
  {
    version: "v1.3.0",
    date: "2023-04-12",
    type: "minor",
    title: "User Management",
    description: "Enhanced user management capabilities.",
    changes: [
      "Role-based access control",
      "User profile management",
      "Password reset functionality",
      "User activity logging",
    ],
  },
  {
    version: "v2.0.0",
    date: "2023-05-20",
    type: "major",
    title: "Real-time Updates",
    description: "Implemented WebSocket for real-time system updates.",
    changes: [
      "Real-time inventory updates",
      "Live notifications",
      "Instant meal serving tracking",
      "Collaborative editing features",
    ],
  },
  {
    version: "v2.1.0",
    date: "2023-06-15",
    type: "minor",
    title: "Advanced Analytics",
    description: "Added advanced analytics and data visualization.",
    changes: [
      "Interactive charts and graphs",
      "Trend analysis",
      "Predictive inventory forecasting",
      "Custom report builder",
    ],
  },
  {
    version: "v2.1.1",
    date: "2023-07-01",
    type: "patch",
    title: "Security Enhancements",
    description: "Improved system security and data protection.",
    changes: ["Enhanced authentication", "Data encryption", "GDPR compliance updates", "Security vulnerability fixes"],
  },
  {
    version: "v2.2.0",
    date: "2023-07-25",
    type: "minor",
    title: "Menu Planning",
    description: "Added menu planning and nutritional analysis features.",
    changes: [
      "Weekly menu planner",
      "Nutritional information tracking",
      "Dietary restriction management",
      "Recipe database",
    ],
  },
  {
    version: "v2.2.1",
    date: "2023-08-10",
    type: "patch",
    title: "Accessibility Improvements",
    description: "Enhanced accessibility features for all users.",
    changes: [
      "Screen reader compatibility",
      "Keyboard navigation improvements",
      "Color contrast enhancements",
      "Font size adjustments",
    ],
  },
  {
    version: "v2.3.0",
    date: "2023-09-05",
    type: "minor",
    title: "Mobile App Integration",
    description: "Released companion mobile app for on-the-go access.",
    changes: [
      "iOS and Android app support",
      "Push notifications",
      "Offline mode capabilities",
      "Barcode scanning for inventory",
    ],
  },
  {
    version: "v3.0.0",
    date: "2023-10-15",
    type: "major",
    title: "Multi-facility Support",
    description: "Added support for managing multiple kindergarten facilities.",
    changes: [
      "Multi-tenant architecture",
      "Facility-specific dashboards",
      "Cross-facility reporting",
      "Resource sharing between facilities",
    ],
  },
  {
    version: "v3.1.0",
    date: "2023-11-10",
    type: "minor",
    title: "Supplier Management",
    description: "Added supplier management and ordering system.",
    changes: ["Supplier database", "Automated order generation", "Order tracking", "Supplier performance metrics"],
  },
  {
    version: "v3.1.1",
    date: "2023-11-30",
    type: "patch",
    title: "Integration Fixes",
    description: "Fixed issues with third-party integrations.",
    changes: [
      "Payment gateway fixes",
      "Calendar integration improvements",
      "Email notification reliability",
      "API compatibility updates",
    ],
  },
  {
    version: "v3.2.0",
    date: "2023-12-20",
    type: "minor",
    title: "Parent Portal",
    description: "Added parent portal for meal visibility and communication.",
    changes: [
      "Parent login system",
      "Meal calendar for parents",
      "Allergy and preference management",
      "Parent-staff messaging",
    ],
  },
  {
    version: "v3.2.1",
    date: "2024-01-15",
    type: "patch",
    title: "Performance Tuning",
    description: "System-wide performance improvements.",
    changes: [
      "Database optimization",
      "Frontend rendering improvements",
      "API response time reduction",
      "Memory usage optimization",
    ],
  },
  {
    version: "v3.3.0",
    date: "2024-02-10",
    type: "minor",
    title: "Advanced Reporting",
    description: "Enhanced reporting capabilities with custom reports.",
    changes: [
      "Report builder interface",
      "Scheduled report generation",
      "Multiple export formats",
      "Report sharing capabilities",
    ],
  },
  {
    version: "v4.0.0",
    date: "2024-03-20",
    type: "major",
    title: "AI-Powered Features",
    description: "Integrated artificial intelligence for smarter operations.",
    changes: [
      "Predictive inventory management",
      "Meal recommendation engine",
      "Anomaly detection for waste reduction",
      "Natural language search capabilities",
    ],
  },
  {
    version: "v4.1.0",
    date: "2024-04-15",
    type: "minor",
    title: "User Tracking Enhancements",
    description: "Improved user tracking and activity monitoring.",
    changes: [
      "Detailed user activity logs",
      "Staff performance metrics",
      "Real-time notification improvements",
      "Enhanced role-based permissions",
    ],
  },
]

export default function VersionsPage() {
  const [expandedVersions, setExpandedVersions] = useState<string[]>([])

  const toggleVersionExpand = (version: string) => {
    if (expandedVersions.includes(version)) {
      setExpandedVersions(expandedVersions.filter((v) => v !== version))
    } else {
      setExpandedVersions([...expandedVersions, version])
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "major":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "minor":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "patch":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-amber-700 mb-2">KinderChef Version History</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track the evolution of our kindergarten meal tracking and inventory management system through its various
          releases and updates.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-amber-50 border border-amber-200">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-100">
              All Versions
            </TabsTrigger>
            <TabsTrigger value="major" className="data-[state=active]:bg-amber-100">
              Major Releases
            </TabsTrigger>
            <TabsTrigger value="minor" className="data-[state=active]:bg-amber-100">
              Minor Updates
            </TabsTrigger>
            <TabsTrigger value="patch" className="data-[state=active]:bg-amber-100">
              Patches
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle>Complete Version History</CardTitle>
              <CardDescription>All releases and updates to the KinderChef system</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {versionHistory.map((version, index) => (
                    <div key={version.version} className="relative">
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-0.5 bg-amber-200 ${
                          index === versionHistory.length - 1 ? "h-6" : "h-full"
                        }`}
                      ></div>
                      <div className="relative ml-6">
                        <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100"></div>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-amber-800">{version.version}</h3>
                              <Badge className={getBadgeColor(version.type)}>
                                {version.type.charAt(0).toUpperCase() + version.type.slice(1)}
                              </Badge>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {version.date}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-800 mb-1">{version.title}</h4>
                            <p className="text-gray-600 mb-2">{version.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600"
                            onClick={() => toggleVersionExpand(version.version)}
                          >
                            {expandedVersions.includes(version.version) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {expandedVersions.includes(version.version) && (
                          <div className="mt-3 pl-4 border-l-2 border-amber-100">
                            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <Code className="h-4 w-4 mr-1" /> Changes in this version:
                            </h5>
                            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                              {version.changes.map((change, i) => (
                                <li key={i}>{change}</li>
                              ))}
                            </ul>
                            <div className="flex gap-2 mt-3">
                              <Button variant="outline" size="sm" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" /> Release Notes
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs">
                                <Download className="h-3 w-3 mr-1" /> Download
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < versionHistory.length - 1 && <Separator className="my-4 bg-amber-100" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="major" className="mt-0">
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle>Major Releases</CardTitle>
              <CardDescription>Significant updates with new features and improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {versionHistory
                    .filter((v) => v.type === "major")
                    .map((version, index, filtered) => (
                      <div key={version.version} className="relative">
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-0.5 bg-red-200 ${
                            index === filtered.length - 1 ? "h-6" : "h-full"
                          }`}
                        ></div>
                        <div className="relative ml-6">
                          <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-red-100"></div>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-red-800">{version.version}</h3>
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Major</Badge>
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {version.date}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-800 mb-1">{version.title}</h4>
                              <p className="text-gray-600 mb-2">{version.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => toggleVersionExpand(version.version)}
                            >
                              {expandedVersions.includes(version.version) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {expandedVersions.includes(version.version) && (
                            <div className="mt-3 pl-4 border-l-2 border-red-100">
                              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Star className="h-4 w-4 mr-1 text-red-500" /> Major changes in this version:
                              </h5>
                              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                {version.changes.map((change, i) => (
                                  <li key={i}>{change}</li>
                                ))}
                              </ul>
                              <div className="flex gap-2 mt-3">
                                <Button variant="outline" size="sm" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" /> Release Notes
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Download className="h-3 w-3 mr-1" /> Download
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        {index < filtered.length - 1 && <Separator className="my-4 bg-red-100" />}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minor" className="mt-0">
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle>Minor Updates</CardTitle>
              <CardDescription>Feature additions and enhancements</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {versionHistory
                    .filter((v) => v.type === "minor")
                    .map((version, index, filtered) => (
                      <div key={version.version} className="relative">
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-0.5 bg-blue-200 ${
                            index === filtered.length - 1 ? "h-6" : "h-full"
                          }`}
                        ></div>
                        <div className="relative ml-6">
                          <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-blue-100"></div>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-blue-800">{version.version}</h3>
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Minor</Badge>
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {version.date}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-800 mb-1">{version.title}</h4>
                              <p className="text-gray-600 mb-2">{version.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                              onClick={() => toggleVersionExpand(version.version)}
                            >
                              {expandedVersions.includes(version.version) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {expandedVersions.includes(version.version) && (
                            <div className="mt-3 pl-4 border-l-2 border-blue-100">
                              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Code className="h-4 w-4 mr-1" /> Changes in this version:
                              </h5>
                              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                {version.changes.map((change, i) => (
                                  <li key={i}>{change}</li>
                                ))}
                              </ul>
                              <div className="flex gap-2 mt-3">
                                <Button variant="outline" size="sm" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" /> Release Notes
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Download className="h-3 w-3 mr-1" /> Download
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        {index < filtered.length - 1 && <Separator className="my-4 bg-blue-100" />}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patch" className="mt-0">
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle>Patches</CardTitle>
              <CardDescription>Bug fixes and minor improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {versionHistory
                    .filter((v) => v.type === "patch")
                    .map((version, index, filtered) => (
                      <div key={version.version} className="relative">
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-0.5 bg-green-200 ${
                            index === filtered.length - 1 ? "h-6" : "h-full"
                          }`}
                        ></div>
                        <div className="relative ml-6">
                          <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-green-100"></div>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-green-800">{version.version}</h3>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Patch</Badge>
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {version.date}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-800 mb-1">{version.title}</h4>
                              <p className="text-gray-600 mb-2">{version.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => toggleVersionExpand(version.version)}
                            >
                              {expandedVersions.includes(version.version) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {expandedVersions.includes(version.version) && (
                            <div className="mt-3 pl-4 border-l-2 border-green-100">
                              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Code className="h-4 w-4 mr-1" /> Fixes in this version:
                              </h5>
                              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                {version.changes.map((change, i) => (
                                  <li key={i}>{change}</li>
                                ))}
                              </ul>
                              <div className="flex gap-2 mt-3">
                                <Button variant="outline" size="sm" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" /> Release Notes
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Download className="h-3 w-3 mr-1" /> Download
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        {index < filtered.length - 1 && <Separator className="my-4 bg-green-100" />}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
