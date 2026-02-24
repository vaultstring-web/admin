import React, { useState } from 'react';
import { Server, Activity, Globe, Shield, Plus, Lock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { BlockchainNetwork } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface NetworkFormData {
  name: string;
  type: string;
  rpcUrl: string;
  chainId: string;
  symbol: string;
}

interface BlockchainNetworkListProps {
  networks: BlockchainNetwork[];
  onAddNetwork: (network: NetworkFormData) => Promise<void>;
  onUpdateNetwork?: (id: string, network: NetworkFormData) => Promise<void>;
  onDeleteNetwork?: (id: string) => Promise<void>;
}

export function BlockchainNetworkList({ networks: initialNetworks, onAddNetwork, onUpdateNetwork, onDeleteNetwork }: BlockchainNetworkListProps) {
  const [networks, setNetworks] = useState(initialNetworks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<NetworkFormData>({
    name: '',
    type: 'public',
    rpcUrl: '',
    chainId: '',
    symbol: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Update local state when props change
  React.useEffect(() => {
    setNetworks(initialNetworks);
  }, [initialNetworks]);

  // Separate custom/private networks from public ones
  const customNetworks = networks.filter(n => n.name.includes('Vault') || n.channel === 'default' || n.name.includes('Private'));
  const publicNetworks = networks.filter(n => !n.name.includes('Vault') && n.channel !== 'default' && !n.name.includes('Private'));

  const handleAdd = async () => {
    setIsLoading(true);
    try {
      await onAddNetwork(formData);
      setIsAddModalOpen(false);
      setFormData({ name: '', type: 'public', rpcUrl: '', chainId: '', symbol: '' });
      toast.success('Blockchain network added successfully');
    } catch {
      toast.error('Failed to add network');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (network: BlockchainNetwork) => {
    setEditingId(network.network_id);
    setFormData({
      name: network.name,
      type: network.channel === 'default' ? 'private' : 'public',
      rpcUrl: network.rpc_url || '',
      chainId: network.chain_id || '',
      symbol: network.symbol || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setIsLoading(true);
    try {
      if (onUpdateNetwork) {
        await onUpdateNetwork(editingId, formData);
      }
      setIsEditModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', type: 'public', rpcUrl: '', chainId: '', symbol: '' });
      toast.success('Network updated successfully');
    } catch {
      toast.error('Failed to update network');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this network? This action cannot be undone.')) {
      try {
        if (onDeleteNetwork) {
          await onDeleteNetwork(id);
        }
        toast.success('Network removed successfully');
      } catch {
        toast.error('Failed to remove network');
      }
    }
  };

  const NetworkCard = ({ network, isCustom }: { network: BlockchainNetwork; isCustom?: boolean }) => (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${isCustom ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'}`}>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCustom ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
            {isCustom ? <Shield size={20} /> : <Globe size={20} />}
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">{network.name}</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">
              {network.network_id}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={network.status === 'healthy' ? 'default' : 'destructive'} className={network.status === 'healthy' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : ''}>
            {network.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(network)}>
                <Edit size={14} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(network.network_id)}>
                <Trash2 size={14} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-xs uppercase tracking-wider">Height</span>
            <div className="flex items-center gap-1.5 font-mono text-slate-700">
              <Server size={12} className="text-slate-400" />
              {network.height?.toLocaleString() || '0'}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-xs uppercase tracking-wider">Last Block</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Activity size={12} className="text-slate-400" />
              {network.last_block_time ? new Date(network.last_block_time).toLocaleTimeString() : '-'}
            </div>
          </div>
        </div>
        {isCustom && (
          <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center gap-2 text-xs text-indigo-700 font-medium">
            <Lock size={12} />
            First Line of Defense Active
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Blockchain Networks</h2>
          <p className="text-sm text-slate-500">Manage connected chains and security protocols</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
          <Plus size={16} /> Add Network
        </Button>
      </div>

      {/* Custom/Security Chains */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900 uppercase tracking-wider">
          <Shield size={16} className="text-indigo-600" />
          Security & Private Chains (First Line of Defense)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customNetworks.length > 0 ? (
            customNetworks.map((net) => <NetworkCard key={net.network_id} network={net} isCustom />)
          ) : (
            <div className="col-span-full py-8 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
              No security or private networks configured.
            </div>
          )}
        </div>
      </div>

      {/* Public/External Chains */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wider">
          <Globe size={16} className="text-slate-500" />
          External Public Blockchains
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicNetworks.length > 0 ? (
            publicNetworks.map((net) => <NetworkCard key={net.network_id} network={net} />)
          ) : (
             <div className="col-span-full py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm">No external blockchains connected.</p>
             </div>
          )}
        </div>
      </div>

      {/* Add Network Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Blockchain Network</DialogTitle>
            <DialogDescription>
              Connect a new blockchain network to the VaultString system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Network Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ethereum Mainnet"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Network Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public Mainnet</SelectItem>
                  <SelectItem value="testnet">Public Testnet</SelectItem>
                  <SelectItem value="private">Private / Consortium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rpc">RPC Endpoint</Label>
              <Input
                id="rpc"
                value={formData.rpcUrl}
                onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chainId">Chain ID</Label>
              <Input
                id="chainId"
                value={formData.chainId}
                onChange={(e) => setFormData({ ...formData, chainId: e.target.value })}
                placeholder="e.g. 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="symbol">Currency Symbol</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="e.g. ETH"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Network'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Network Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Blockchain Network</DialogTitle>
            <DialogDescription>
              Update configuration for the selected blockchain network.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Network Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Network Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public Mainnet</SelectItem>
                  <SelectItem value="testnet">Public Testnet</SelectItem>
                  <SelectItem value="private">Private / Consortium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-rpc">RPC Endpoint</Label>
              <Input
                id="edit-rpc"
                value={formData.rpcUrl}
                onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-chainId">Chain ID</Label>
              <Input
                id="edit-chainId"
                value={formData.chainId}
                onChange={(e) => setFormData({ ...formData, chainId: e.target.value })}
                placeholder="e.g. 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-symbol">Currency Symbol</Label>
              <Input
                id="edit-symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="e.g. ETH"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Network'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
