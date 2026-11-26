import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ClipboardList, FileText, House, CircleUser, List, UserRound } from "lucide-react"

const listMenu = [
  {"name" : "Dashboard",
 "url" : "/admin",
 "icon" : House
},
{"name" : "User Management",
 "url" : "/admin/user-management",
 "icon" : UserRound
},
{"name" : "Check",
 "url" : "/admin/check",
 "icon" : ClipboardList
},
{"name" : "Facility",
 "url" : "/admin/facility",
 "icon" : FileText
}
]



export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <h1 className="text-lg font-bold text-center">Admin Dashboard</h1>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {listMenu.map((menu) => (
                <SidebarMenuItem key={menu.name}>
                  <SidebarMenuButton asChild>
                    <a href={menu.url}>
                      <menu.icon />
                      <span>{menu.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}