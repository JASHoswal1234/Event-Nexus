import React, { useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/Sidebar';
import { LayoutDashboard, Calendar, Users, UsersRound, Megaphone, Settings } from 'lucide-react';

const AdminSidebar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Events",
      href: "/admin/events",
      icon: <Calendar className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <Users className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Teams",
      href: "/admin/teams",
      icon: <UsersRound className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Announcements",
      href: "/admin/announcements",
      icon: <Megaphone className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="text-gray-700 h-5 w-5 flex-shrink-0" />,
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
};

export default AdminSidebar;
