/**
 * CMS Management Page
 * Content Management System - Coming Soon
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileEdit, Bell, ArrowRight } from 'lucide-react';

export const CMSPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Content Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage website content, pages, and media
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '50ms' }}>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25">
            <FileEdit className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Coming Soon
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
            The Content Management System is currently under development. Soon you'll be able to manage all your website content, pages, blog posts, and media files from this dashboard.
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            {[
              { icon: '📝', title: 'Page Builder', desc: 'Visual page editor' },
              { icon: '🖼️', title: 'Media Library', desc: 'Upload & manage files' },
              { icon: '📰', title: 'Blog Management', desc: 'Create & edit posts' },
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl animate-fade-up"
                style={{ animationDelay: `${(index + 2) * 50}ms` }}
              >
                <span className="text-2xl mb-2 block">{feature.icon}</span>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{feature.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="border-slate-200 dark:border-slate-700 gap-2"
          >
            <Bell className="h-4 w-4" />
            Notify me when ready
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CMSPlaceholder;