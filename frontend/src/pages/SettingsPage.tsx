import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Bell, Clock, Building } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { SystemSettings } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    appName: 'IssueFlow Enterprise',
    companyName: 'Apex Innovations Corp',
    issueKeyPrefix: 'ISS',
    allowPublicRegistration: 'true',
    defaultDueDateDays: '7',
    slaCriticalHours: '4',
    slaHighHours: '24',
    slaMediumHours: '72',
    slaLowHours: '168',
    emailNotifications: 'true',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    settingsService
      .getSettings()
      .then((data) => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleChange = (key: keyof SystemSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await settingsService.updateSettings(settings);
      toast.success('System settings saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <PageHeader
        title="System Settings"
        description="Global application configuration, enterprise branding, and operational SLA parameters."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Identification */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <CardTitle>Organization & Branding</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Application Name"
                value={settings.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
              />
              <Input
                label="Company Name"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Issue Key Prefix"
                value={settings.issueKeyPrefix}
                onChange={(e) => handleChange('issueKeyPrefix', e.target.value)}
                helperText="Prefix for ticket numbers (e.g. ISS generates ISS-1001)"
              />
              <Input
                label="Default Due Date (Days)"
                type="number"
                value={settings.defaultDueDateDays}
                onChange={(e) => handleChange('defaultDueDateDays', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SLA Targets */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <CardTitle>Service Level Agreement (SLA) Targets</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-4">
              Target maximum hours before an issue is flagged as overdue:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="Critical (Hours)"
                type="number"
                value={settings.slaCriticalHours}
                onChange={(e) => handleChange('slaCriticalHours', e.target.value)}
              />
              <Input
                label="High (Hours)"
                type="number"
                value={settings.slaHighHours}
                onChange={(e) => handleChange('slaHighHours', e.target.value)}
              />
              <Input
                label="Medium (Hours)"
                type="number"
                value={settings.slaMediumHours}
                onChange={(e) => handleChange('slaMediumHours', e.target.value)}
              />
              <Input
                label="Low (Hours)"
                type="number"
                value={settings.slaLowHours}
                onChange={(e) => handleChange('slaLowHours', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={isSaving} icon={<Save className="w-4 h-4" />}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
