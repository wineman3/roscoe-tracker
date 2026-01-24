"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BouncingRoscoe } from "./bouncing-roscoe";

interface QuickAddWalkProps {
  userId: string;
  onSubmit: (miles: number, notes: string, date: string) => Promise<void>;
}

export function QuickAddWalk({ userId, onSubmit }: QuickAddWalkProps) {
  const [miles, setMiles] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showBounce, setShowBounce] = useState(false);

  const handleBounceComplete = useCallback(() => setShowBounce(false), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const milesValue = parseFloat(miles);
      if (isNaN(milesValue) || milesValue <= 0 || milesValue > 99.99) {
        throw new Error(
          "Please enter a valid distance between 0.01 and 99.99 miles",
        );
      }
      setShowBounce(true);
      await onSubmit(milesValue, notes, date);

      setMiles("");
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to add walk";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showBounce && <BouncingRoscoe onComplete={handleBounceComplete} />}
      <Card>
        <CardHeader>
          <CardTitle>Log a Walk</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="miles">Miles Walked</Label>
              <Input
                id="miles"
                type="number"
                step="0.01"
                min="0.01"
                max="99.99"
                value={miles}
                onChange={(e) => setMiles(e.target.value)}
                required
                placeholder="2.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Morning walk around the neighborhood"
              />
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-border text-red-700 px-4 py-3 rounded-base text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border-2 border-border text-green-700 px-4 py-3 rounded-base text-sm">
                Walk logged successfully!
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? "Adding..." : "Add Walk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
