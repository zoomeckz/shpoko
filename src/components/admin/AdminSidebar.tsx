import { 
  Users, 
  BookOpen, 
  ShoppingBag, 
  MessageSquare, 
  BarChart3, 
  Home,
  Settings,
  Trophy,
  Scroll,
  Crown,
  Image,
  Target
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

const contentItems = [
  { title: "Lessons", url: "/admin/lessons", icon: BookOpen },
  { title: "Quizzes", url: "/admin/quizzes", icon: Scroll },
  { title: "Vocabulary", url: "/admin/vocabulary", icon: BookOpen },
];

const gameItems = [
  { title: "Leagues", url: "/admin/leagues", icon: Trophy },
  { title: "Quests", url: "/admin/quests", icon: Target },
];

const shopItems = [
  { title: "Skins", url: "/admin/skins", icon: Image },
  { title: "Shop Items", url: "/admin/shop", icon: ShoppingBag },
  { title: "Premium", url: "/admin/premium", icon: Crown },
];

const communityItems = [
  { title: "Forum", url: "/admin/forum", icon: MessageSquare },
  { title: "Hall of Fame", url: "/admin/hall-of-fame", icon: Trophy },
];

const settingsItems = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={cn(collapsed ? "w-14" : "w-60", "border-r")} collapsible="icon">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/admin"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Games
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {gameItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Shop
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {shopItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Community
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
