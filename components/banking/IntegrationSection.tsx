// components/integrations/IntegrationsSection.tsx
'use client';

import React from 'react';
import { Briefcase, Activity, Cable } from 'lucide-react';
import { BankIntegration, Corridor, HealthStatus } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface IntegrationsSectionProps {
  integrations: BankIntegration[];
}

export const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({ integrations }) => {
  const corridors = [Corridor.MALAWI, Corridor.CHINA];

  const getCorridorColor = (corridor: Corridor) => {
    switch (corridor) {
      case Corridor.MALAWI:
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-200 dark:border-red-800',
        };
      case Corridor.CHINA:
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-200 dark:border-amber-800',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700',
        };
    }
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.HEALTHY:
        return {
          bg: 'bg-green-100 dark:bg-green-900',
          text: 'text-green-800 dark:text-green-300',
          border: 'border-green-200 dark:border-green-800',
        };
      case HealthStatus.DEGRADED:
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900',
          text: 'text-yellow-800 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-800',
        };
      case HealthStatus.OFFLINE:
        return {
          bg: 'bg-red-100 dark:bg-red-900',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-800 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-700',
        };
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Integrations Health</CardTitle>
          <CardDescription>Cross-border gateway status monitoring</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          <Cable className="h-3 w-3 mr-1.5" />
          Manage Webhooks
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {corridors.map((corridor) => {
          const corridorColor = getCorridorColor(corridor);
          
          return (
            <div key={corridor} className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`${corridorColor.bg} ${corridorColor.text} ${corridorColor.border} text-xs font-bold uppercase tracking-wider`}
                >
                  {corridor} Corridor
                </Badge>
                <div className="h-px flex-1 bg-border"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations
                  .filter((i) => i.corridor === corridor)
                  .map((integration) => (
                    <IntegrationCard 
                      key={integration.id} 
                      integration={integration} 
                      getStatusColor={getStatusColor}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

interface IntegrationCardProps {
  integration: BankIntegration;
  getStatusColor: (status: HealthStatus) => {
    bg: string;
    text: string;
    border: string;
  };
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, getStatusColor }) => {
  const statusClasses = getStatusColor(integration.status);
  
  return (
    <Card className="hover:border-primary/20 transition-colors">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            integration.status === HealthStatus.HEALTHY 
              ? 'bg-primary/5 dark:bg-primary/10' 
              : 'bg-muted'
          }`}>
            {integration.provider === 'Bank' ? (
              <Briefcase className="h-5 w-5 text-primary" />
            ) : (
              <Activity className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold">{integration.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{integration.provider}</span>
              <span className="text-xs text-muted-foreground/30">•</span>
              <span className="text-xs text-muted-foreground">
                Sync: {integration.lastSync}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-1">
          <Badge
            variant="outline"
            className={`${statusClasses.bg} ${statusClasses.text} ${statusClasses.border} text-xs font-bold uppercase`}
          >
            {integration.status}
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">
            {integration.availability}% uptime
          </span>
        </div>
      </div>
    </Card>
  );
};