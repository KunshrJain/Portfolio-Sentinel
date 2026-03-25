package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"os"
	"os/signal"
	"time"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

func main() {
	redisClient := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
	if _, err := redisClient.Ping(ctx).Result(); err != nil {
		log.Fatalf("Redis error: %v", err)
	}
	fmt.Println("Redis connected. Simulating Indian Markets (NSE)...")

	stocks := map[string]float64{
		"RELIANCE.NS": 2950.50,
		"TCS.NS":      4120.00,
		"HDFCBANK.NS": 1440.25,
		"INFY.NS":     1680.10,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)

	go func() {
		for {
			for sym, price := range stocks {
				changePercent := (rand.Float64() - 0.48) * 0.002
				stocks[sym] = price * (1 + changePercent)
				handleTrade(redisClient, sym, stocks[sym])
			}
			time.Sleep(1 * time.Second)
		}
	}()

	<-stop
	fmt.Println("Shutting down")
}

func handleTrade(rc *redis.Client, symbol string, currentPrice float64) {
	updateMsg := fmt.Sprintf(`{"symbol": "%s", "price": %f}`, symbol, currentPrice)
	rc.Publish(ctx, "prices:realtime", updateMsg)
}
