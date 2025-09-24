"use client"

import type React from "react"

import { useState } from "react"
import { Gavel, Plus, Minus, Sparkles } from "lucide-react"
import { Button, TextField, Card, CardContent, CardHeader, Alert, Typography } from "@mui/material"
import { useToast } from "@/hoooks/use-toast"
import { ConfettiEffect } from "@/components/confetti-effect"
import type { Artwork } from "@/lib/mock-data"

interface BidFormProps {
  artwork: Artwork
  minBid: number
}

export function BidForm({ artwork, minBid }: BidFormProps) {
  const [bidAmount, setBidAmount] = useState(minBid.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const { toast } = useToast()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const isAuctionEnded = new Date() > artwork.endTime
  const currentBidAmount = Number.parseFloat(bidAmount) || 0
  const isValidBid = currentBidAmount >= minBid
  const canSubmitBid = isValidBid && !isSubmitting && !isAuctionEnded

  const quickBidAmounts = [
    minBid,
    minBid + artwork.minIncrement,
    minBid + artwork.minIncrement * 2,
    minBid + artwork.minIncrement * 5,
  ]

  const handleQuickBid = (amount: number) => {
    setBidAmount(amount.toString())
  }

  const adjustBid = (increment: number) => {
    const newAmount = Math.max(minBid, currentBidAmount + increment)
    setBidAmount(newAmount.toString())
  }

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmitBid) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success feedback
      setShowConfetti(true)
      toast({
        title: "Bid Placed Successfully!",
        description: `Your bid of ${formatPrice(currentBidAmount)} has been placed.`,
      })

      // Reset form
      setBidAmount(minBid.toString())

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error) {
      toast({
        title: "Bid Failed",
        description: "There was an error placing your bid. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuctionEnded) {
    return (
      <Card>
        <CardHeader>
          <Typography variant="h6" className="text-lg flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Auction Ended
          </Typography>
        </CardHeader>
        <CardContent>
          <Alert severity="info">
            This auction has ended. The winning bid was {formatPrice(artwork.currentBid)} by{" "}
            {artwork.highestBidder || "Anonymous"}.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {showConfetti && <ConfettiEffect />}

      <Card>
        <CardHeader>
          <Typography variant="h6" className="text-lg flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Place Your Bid
          </Typography>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Bid Buttons */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-3 block">Quick Bid</label>
            <div className="grid grid-cols-2 gap-2">
              {quickBidAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickBid(amount)}
                  className="text-sm"
                >
                  {formatPrice(amount)}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Bid Input */}
          <form onSubmit={handleSubmitBid} className="space-y-4">
            <div>
              <label htmlFor="bidAmount" className="text-sm font-medium text-muted-foreground mb-2 block">
                Custom Bid Amount
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => adjustBid(-artwork.minIncrement)}
                  disabled={currentBidAmount <= minBid}
                  className="px-3"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <TextField
                    id="bidAmount"
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    inputProps={{ min: minBid, step: artwork.minIncrement }}
                    className="pl-8 text-center font-semibold"
                    placeholder={minBid.toString()}
                  />
                </div>

                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => adjustBid(artwork.minIncrement)}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {!isValidBid && bidAmount && (
                <p className="text-sm text-destructive mt-2">
                  Minimum bid is {formatPrice(minBid)} (current bid + increment)
                </p>
              )}
            </div>

            {/* Bid Summary */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your bid:</span>
                <span className="font-semibold">{formatPrice(currentBidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current high bid:</span>
                <span>{formatPrice(artwork.currentBid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your max increase:</span>
                <span className="font-semibold text-primary">
                  +{formatPrice(Math.max(0, currentBidAmount - artwork.currentBid))}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" fullWidth disabled={!canSubmitBid} size="large">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Placing Bid...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Place Bid {formatPrice(currentBidAmount)}
                </>
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center">
              By placing a bid, you agree to our{" "}
              <a href="#" className="underline hover:text-foreground">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-foreground">
                Bidding Policy
              </a>
              .
            </p>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
         
