import React from 'react';

export function SidebarItem({ icon, label, active, collapsed, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  collapsed?: boolean,
  onClick?: () => void
}) {
  return (
    <div 
      onClick={onClick}
      className={`sidebar-item ${active ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
      {active && !collapsed && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}
    </div>
  );
}

export default SidebarItem;
