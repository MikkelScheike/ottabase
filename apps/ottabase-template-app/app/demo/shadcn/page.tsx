"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
  toast,
} from "@ottabase/ui-shadcn";
import { Info, Mail, Palette } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const notificationExamples = [
  {
    id: "success",
    title: "Success",
    description: "Your workspace has been deployed",
    action: () => toast.success("Workspace deployed"),
  },
  {
    id: "warning",
    title: "Heads up",
    description: "Billing information needs attention",
    action: () => toast.warning("Billing alert"),
  },
  {
    id: "info",
    title: "Background sync",
    description: "Configuration is being updated",
    action: () =>
      toast("Sync started", { description: "Changes will appear soon." }),
  },
];

export default function ShadcnDemoPage() {
  const [notifications] = useState(notificationExamples);
  const [isNotificationsEnabled, setNotificationsEnabled] = useState(true);
  const [message, setMessage] = useState(
    "Thanks for exploring shadcn/ui in Ottabase!",
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="ghost"
            className="w-fit text-muted-foreground hover:text-foreground"
          >
            <Link href="/demo">← Back to Demo Gallery</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="uppercase">
            New
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            shadcn/ui component sampler
          </h1>
        </div>
        <p className="max-w-3xl text-muted-foreground">
          These examples showcase the reusable primitives exposed from{" "}
          <code>@ottabase/ui-shadcn</code>. Combine them with Tailwind utilities
          and the shared theme provider to deliver consistent experiences across
          apps.
        </p>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="form">Form controls</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick contact</CardTitle>
              <CardDescription>
                Compose a message with the shared input primitives.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Switch
                id="notifications"
                checked={isNotificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Toggle to send via Ottabase notifications service.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  onClick={() =>
                    toast(
                      isNotificationsEnabled
                        ? "Message scheduled"
                        : "Draft saved locally",
                      {
                        description: message,
                      },
                    )
                  }
                >
                  Send message
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trigger toasts</CardTitle>
              <CardDescription>
                The <code>toast</code> helper comes from Sonner and is
                re-exported for convenience.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {notifications.map((notification) => (
                <Button
                  key={notification.id}
                  onClick={notification.action}
                  variant={
                    notification.id === "warning" ? "secondary" : "default"
                  }
                  className="justify-start"
                >
                  {notification.title}
                </Button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cards and badges</CardTitle>
              <CardDescription>
                Use cards, badges, and separators to create easy-to-scan
                layouts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2">
                <Badge className="w-fit">Active workspace</Badge>
                <p className="text-sm text-muted-foreground">
                  Tailwind utilities pair with the shared design tokens to keep
                  spacing consistent.
                </p>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Palette className="h-5 w-5" />
                      Theming
                    </CardTitle>
                    <CardDescription>
                      The global theme provider syncs Mantine and Tailwind color
                      modes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      The <code>ShadcnProviders</code> component hooks into the
                      existing Ottabase theming stack so components respond
                      instantly to mode toggles.
                    </p>
                    <p>
                      Try switching themes from the Mantine demo page and come
                      back—state is preserved thanks to the shared storage
                      prefix.
                    </p>
                  </CardContent>
                </Card>
                <Card className={cn("border-muted-foreground/30 bg-muted/40")}>
                  <CardHeader>
                    <CardTitle>Composable primitives</CardTitle>
                    <CardDescription>
                      Combine the exported building blocks to design data-heavy
                      screens quickly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      All components ship as unopinionated primitives so product
                      teams can iterate without re-writing styles.
                    </p>
                    <p>
                      Each primitive keeps accessibility concerns handled via
                      Radix libraries.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild>
                      <Link
                        href="https://ui.shadcn.com/docs/components"
                        target="_blank"
                      >
                        Browse original docs
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
