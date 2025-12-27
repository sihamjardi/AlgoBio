import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Settings as SettingsIcon, User, Bell, Palette, Database, Shield, Moon, Sun } from "lucide-react";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-gray-600" />
          Settings
        </h2>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-gray-600" />
          <h3>Profile Information</h3>
        </div>

        <div className="flex items-start gap-6 mb-6">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
              DS
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue="Dr. Sarah Smith" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="sarah.smith@university.edu" className="mt-2" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input id="institution" defaultValue="Stanford University" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" defaultValue="Molecular Biology" className="mt-2" />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input 
                id="bio" 
                defaultValue="Bioinformatics researcher specializing in cancer genomics" 
                className="mt-2" 
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button>Save Changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3>Appearance</h3>
        </div>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-purple-600" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="mb-1">Dark Mode</p>
                <p className="text-sm text-gray-500">Switch between light and dark theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <Separator />

          {/* Color Scheme */}
          <div>
            <Label>Color Scheme</Label>
            <div className="grid grid-cols-4 gap-3 mt-3">
              <button className="aspect-square rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 ring-2 ring-blue-600 ring-offset-2"></button>
              <button className="aspect-square rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-50 hover:opacity-100 transition-opacity"></button>
              <button className="aspect-square rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-50 hover:opacity-100 transition-opacity"></button>
              <button className="aspect-square rounded-xl bg-gradient-to-br from-orange-500 to-red-500 opacity-50 hover:opacity-100 transition-opacity"></button>
            </div>
          </div>

          <Separator />

          {/* Font Size */}
          <div>
            <Label>Interface Scale</Label>
            <Select defaultValue="medium">
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium (Default)</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3>Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="mb-1">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive email updates about your analyses</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="mb-1">Analysis Complete Alerts</p>
              <p className="text-sm text-gray-500">Get notified when long-running analyses finish</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="mb-1">Collaboration Updates</p>
              <p className="text-sm text-gray-500">Notifications when team members share sequences</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Data & Storage */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-gray-600" />
          <h3>Data & Storage</h3>
        </div>

        <div className="space-y-6">
          {/* Storage Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-sm">2.4 GB / 10 GB</p>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-[24%] bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            </div>
          </div>

          <Separator />

          {/* Auto-save */}
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1">Auto-save Sequences</p>
              <p className="text-sm text-gray-500">Automatically save sequences after validation</p>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>

          <Separator />

          {/* Default Settings */}
          <div className="space-y-3">
            <div>
              <Label>Default Sequence Type</Label>
              <Select defaultValue="dna">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dna">DNA</SelectItem>
                  <SelectItem value="rna">RNA</SelectItem>
                  <SelectItem value="protein">Protein</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Default BLAST Database</Label>
              <Select defaultValue="nr">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nr">Non-redundant (nr)</SelectItem>
                  <SelectItem value="refseq">RefSeq</SelectItem>
                  <SelectItem value="pdb">PDB</SelectItem>
                  <SelectItem value="swissprot">SwissProt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Export All Data
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              Clear All Sequences
            </Button>
          </div>
        </div>
      </Card>

      {/* Security & Privacy */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-gray-600" />
          <h3>Security & Privacy</h3>
        </div>

        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          
          <Separator />

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="mb-1">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="mb-1">Data Sharing</p>
              <p className="text-sm text-gray-500">Allow anonymous usage statistics</p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="pt-3 space-y-3">
            <Button variant="outline" className="w-full justify-start text-gray-600">
              Privacy Policy
            </Button>
            <Button variant="outline" className="w-full justify-start text-gray-600">
              Terms of Service
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-2 border-red-200 bg-red-50">
        <h3 className="text-red-700 mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <p className="text-sm text-red-600">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
