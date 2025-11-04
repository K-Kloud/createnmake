import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePayoutSettings } from "@/hooks/usePayoutSettings";
import { useForm } from "react-hook-form";
import { MakerPayoutSettings } from "@/types/payout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PayoutSettingsProps {
  makerId: string;
}

export const PayoutSettings = ({ makerId }: PayoutSettingsProps) => {
  const { settings, updateSettings, isUpdating } = usePayoutSettings(makerId);
  const { register, handleSubmit, watch, setValue } = useForm<Partial<MakerPayoutSettings>>({
    defaultValues: settings || {},
  });

  const paymentMethod = watch('payment_method') || 'bank_transfer';

  const onSubmit = (data: Partial<MakerPayoutSettings>) => {
    updateSettings(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Settings</CardTitle>
        <CardDescription>
          Configure your payout preferences and payment details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payout_frequency">Payout Frequency</Label>
              <Select
                defaultValue={settings?.payout_frequency || 'weekly'}
                onValueChange={(value) => setValue('payout_frequency', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_payout_amount">Minimum Payout Amount ($)</Label>
              <Input
                id="minimum_payout_amount"
                type="number"
                step="0.01"
                defaultValue={settings?.minimum_payout_amount || 50}
                {...register('minimum_payout_amount', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              defaultValue={settings?.payment_method || 'bank_transfer'}
              onValueChange={(value) => setValue('payment_method', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={paymentMethod} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bank_transfer">Bank</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
            </TabsList>

            <TabsContent value="bank_transfer" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank_account_name">Account Name</Label>
                <Input
                  id="bank_account_name"
                  defaultValue={settings?.bank_account_name}
                  {...register('bank_account_name')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  defaultValue={settings?.bank_name}
                  {...register('bank_name')}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    type="password"
                    defaultValue={settings?.bank_account_number}
                    {...register('bank_account_number')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_routing_number">Routing Number</Label>
                  <Input
                    id="bank_routing_number"
                    defaultValue={settings?.bank_routing_number}
                    {...register('bank_routing_number')}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="paypal" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paypal_email">PayPal Email</Label>
                <Input
                  id="paypal_email"
                  type="email"
                  defaultValue={settings?.paypal_email}
                  {...register('paypal_email')}
                />
              </div>
            </TabsContent>

            <TabsContent value="stripe" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe_account_id">Stripe Account ID</Label>
                <Input
                  id="stripe_account_id"
                  defaultValue={settings?.stripe_account_id}
                  {...register('stripe_account_id')}
                  placeholder="acct_..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
