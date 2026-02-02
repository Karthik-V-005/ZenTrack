import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Smartphone, 
  ChevronRight,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import { useZenStore } from '../store/useStore';

export const Settings = () => {
  const { user } = useZenStore();

  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile Information", value: user?.name || "Alex Rivers" },
        { icon: Shield, label: "Security & Privacy", value: "Verified" },
        { icon: Bell, label: "Notifications", value: "Enabled" }
      ]
    },
    {
      title: "App Settings",
      items: [
        { icon: Palette, label: "Appearance", value: "Dark Theme" },
        { icon: Monitor, label: "Display Scaling", value: "Standard" },
        { icon: Database, label: "Data Storage", value: "Local + Sync" }
      ]
    },
    {
      title: "Device Connections",
      items: [
        { icon: Smartphone, label: "Mobile Sync", value: "iPhone 15 Pro" },
        { icon: Database, label: "External Integrations", value: "Google Calendar, Slack" }
      ]
    }
  ];

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-500">Manage your account and app preferences.</p>
      </header>

      <div className="space-y-10">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 px-2">{section.title}</h3>
            <div className="bg-[#111114] border border-slate-800/50 rounded-3xl overflow-hidden divide-y divide-slate-800/50">
              {section.items.map((item, iIdx) => (
                <button 
                  key={iIdx} 
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-slate-500 text-sm">{item.value}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-6 border-t border-slate-800/50">
          <button className="text-rose-400 hover:text-rose-300 font-semibold px-2 transition-colors">
            Delete Account
          </button>
          <p className="mt-2 text-xs text-slate-600 px-2 leading-relaxed">
            Deleting your account will permanently remove all your fatigue history, usage patterns, and AI insights. This action cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
};