package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

type Trade struct {
	Symbol string `json:"s"`
	Price  string `json:"p"`
}

var ctx = context.Background()

func main() {
	redisClient := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})
	
	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Redis error: %v", err)
	}
	fmt.Println("Redis connected")

	url := "wss://stream.binance.com:9443/ws/btcusdt@trade/ethusdt@trade/solusdt@trade/xrpusdt@trade"
	con, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer con.Close()
	fmt.Println("WebSocket connected")

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)

	go func() {
		for {
			_, message, err := con.ReadMessage()
			if err != nil {
				log.Println("Read error:", err)
				return
			}

			var trade Trade
			if err := json.Unmarshal(message, &trade); err != nil {
				continue
			}

			price, err := strconv.ParseFloat(trade.Price, 64)
			if err != nil {
				continue
			}

			handleTrade(redisClient, trade.Symbol, price)
		}
	}()

	<-stop
	fmt.Println("Shutting down")
}

func handleTrade(rc *redis.Client, symbol string, currentPrice float64) {
	key := fmt.Sprintf("price:%s", symbol)
	
	prevPriceStr, err := rc.Get(ctx, key).Result()
	if err == nil {
		prevPrice, _ := strconv.ParseFloat(prevPriceStr, 64)
		
		change := ((currentPrice - prevPrice) / prevPrice) * 100
		
		if change <= -2.0 {
			alertMsg := fmt.Sprintf(`{"symbol": "%s", "price": %f, "change": %f}`, symbol, currentPrice, change)
			rc.Publish(ctx, "alerts:price_drop", alertMsg)
			fmt.Println("ALERT PUBLISHED:", alertMsg)
		}
		
		if currentPrice != prevPrice {
			updateMsg := fmt.Sprintf(`{"symbol": "%s", "price": %f}`, symbol, currentPrice)
			rc.Publish(ctx, "prices:realtime", updateMsg)
		}
	}
	
	rc.Set(ctx, key, currentPrice, time.Minute*5)
}
