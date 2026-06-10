'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PageConfiguration() {
  const [config, setConfig] = useState({
    pageName: '',
    pageUrl: '',
    pageId: '',
    giftLinkUrl: '',
    giftLinkTitle: '',
    giftLinkDescription: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/page-configurations');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setConfig({
            pageName: data.page_name || '',
            pageUrl: data.page_url || '',
            pageId: data.page_id || '',
            giftLinkUrl: data.gift_link_url || '',
            giftLinkTitle: data.gift_link_title || '',
            giftLinkDescription: data.gift_link_description || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/page-configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_name: config.pageName,
          page_url: config.pageUrl,
          page_id: config.pageId,
          gift_link_url: config.giftLinkUrl,
          gift_link_title: config.giftLinkTitle,
          gift_link_description: config.giftLinkDescription,
        }),
      });

      if (response.ok) {
        alert('Configuration saved!');
      } else {
        const errorData = await response.json();
        console.error('Error saving configuration:', errorData);
        alert(`Error saving configuration: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(`Error saving configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setSaving(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facebook Page Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Page Name</Label>
          <Input
            value={config.pageName}
            onChange={(e) => setConfig({ ...config, pageName: e.target.value })}
            placeholder="My Business Page"
          />
        </div>

        <div>
          <Label>Page URL</Label>
          <Input
            value={config.pageUrl}
            onChange={(e) => setConfig({ ...config, pageUrl: e.target.value })}
            placeholder="https://www.facebook.com/your-page"
          />
        </div>

        <div>
          <Label>Facebook Page ID</Label>
          <Input
            value={config.pageId}
            onChange={(e) => setConfig({ ...config, pageId: e.target.value })}
            placeholder="123456789"
          />
        </div>

        <div>
          <Label>Gift Link URL</Label>
          <Input
            value={config.giftLinkUrl}
            onChange={(e) => setConfig({ ...config, giftLinkUrl: e.target.value })}
            placeholder="https://your-site.com/gift"
          />
        </div>

        <div>
          <Label>Gift Link Title</Label>
          <Input
            value={config.giftLinkTitle}
            onChange={(e) => setConfig({ ...config, giftLinkTitle: e.target.value })}
            placeholder="Get Your Free Gift"
          />
        </div>

        <div>
          <Label>Gift Link Description</Label>
          <Textarea
            value={config.giftLinkDescription}
            onChange={(e) => setConfig({ ...config, giftLinkDescription: e.target.value })}
            placeholder="Description of the gift..."
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </CardContent>
    </Card>
  );
}
