import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, LogOut, ShieldCheck, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
    outline: "border-2 border-slate-200 text-slate-700 hover:border-blue-600 hover:text-blue-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
    {children}
  </div>
);

// --- Badge ---
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let styles = "bg-slate-100 text-slate-700";
  let icon = <Clock className="w-3 h-3 mr-1" />;

  if (status.includes("Risk") || status.includes("Alert")) {
    styles = "bg-red-100 text-red-700 border border-red-200";
    icon = <AlertTriangle className="w-3 h-3 mr-1" />;
  } else if (status.includes("Approved") || status.includes("Ready")) {
    styles = "bg-emerald-100 text-emerald-700 border border-emerald-200";
    icon = <CheckCircle className="w-3 h-3 mr-1" />;
  } else if (status === "Submitted" || status === "Analyzing") {
    styles = "bg-blue-50 text-blue-700 border border-blue-200";
    icon = <ShieldCheck className="w-3 h-3 mr-1" />;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {icon}
      {status}
    </span>
  );
};

// --- Layouts ---
export const Navbar: React.FC<{ title: string; backLink?: string; type: 'customer' | 'employee' }> = ({ title, backLink, type }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backLink && (
            <Link to={backLink} className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
          <span className="font-bold text-xl tracking-tight text-slate-900">ClaimSight</span>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <span className="text-sm font-medium text-slate-500">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${type === 'customer' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {type === 'customer' ? 'Customer Portal' : 'Adjuster Workspace'}
          </span>
          <Link to="/">
            <LogOut className="w-5 h-5 text-slate-400 hover:text-red-500 transition-colors ml-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
    {children}
  </div>
);