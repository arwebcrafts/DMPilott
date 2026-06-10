'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MetaAppCredentials() {
  const [credentials, setCredentials] = useState({
    appId: '',
    appSecret: '',
    pageAccessToken: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/meta-credentials');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setCredentials({
            appId: data.app_id || '',
            appSecret: '', // Never load secret back for security
            pageAccessToken: '', // Never load token back for security
          });
        }
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/meta-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: credentials.appId,
          app_secret: credentials.appSecret,
          page_access_token: credentials.pageAccessToken,
        }),
      });

      if (response.ok) {
        alert('Credentials saved!');
        // Clear sensitive fields after save
        setCredentials({
          ...credentials,
          appSecret: '',
          pageAccessToken: '',
        });
      } else {
        alert('Error saving credentials');
      }
    } catch (error) {
      alert('Error saving credentials');
    }
    setSaving(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta App Credentials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>App ID</Label>
          <Input
            value={credentials.appId}
            onChange={(e) => setCredentials({ ...credentials, appId: e.target.value })}
            placeholder="Your App ID"
          />
        </div>

        <div>
          <Label>App Secret</Label>
          <Input
            type="password"
            value={credentials.appSecret}
            onChange={(e) => setCredentials({ ...credentials, appSecret: e.target.value })}
            placeholder="Your App Secret"
          />
        </div>

        <div>
          <Label>Page Access Token</Label>
          <Input
            type="password"
            value={credentials.pageAccessToken}
            onChange={(e) => setCredentials({ ...credentials, pageAccessToken: e.target.value })}
            placeholder="Your Page Access Token"
          />
        </div>

        <div className="bg-blue-50 p-4 rounded text-sm">
          <p className="font-semibold">ℹ️ Note:</p>
          <p>These credentials are used to send messages via Messenger Send API. No additional permissions are required.</p>
          <p className="mt-2">The system uses a self-reported follow system (honor system) which is fully compliant with Meta's policies.</p>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Credentials'}
        </Button>
      </CardContent>
    </Card>
  );
}
