package middleware

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"backend-api/internal/app/session"

	"github.com/gin-gonic/gin"
)

type IdentityType string

const (
	IdentityIP    IdentityType = "ip"
	IdentityUser  IdentityType = "user"
	IdentityAdmin IdentityType = "admin"
)

type bucket struct {
	Count     int
	ResetAt   time.Time
	UpdatedAt time.Time
}

type RateLimiter struct {
	mu      sync.Mutex
	buckets map[string]*bucket
}

func NewRateLimiter() *RateLimiter {
	limiter :=
		&RateLimiter{
			buckets: map[string]*bucket{},
		}

	go limiter.cleanupLoop()

	return limiter
}

func (limiter *RateLimiter) LimitPathPrefix(
	prefix string,
	group string,
	maxRequests int,
	window time.Duration,
	identity IdentityType,
	appDB *sql.DB,
) gin.HandlerFunc {
	inner :=
		limiter.Limit(
			group,
			maxRequests,
			window,
			identity,
			appDB,
		)

	return func(c *gin.Context) {
		if !strings.HasPrefix(
			c.Request.URL.Path,
			prefix,
		) {
			c.Next()
			return
		}

		inner(c)
	}
}

func (limiter *RateLimiter) Limit(
	group string,
	maxRequests int,
	window time.Duration,
	identity IdentityType,
	appDB *sql.DB,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		key :=
			limiter.keyForRequest(
				c,
				group,
				identity,
				appDB,
			)

		allowed, retryAfter :=
			limiter.allow(
				key,
				maxRequests,
				window,
			)

		if !allowed {
			c.Header(
				"Retry-After",
				fmt.Sprintf(
					"%.0f",
					retryAfter.Seconds(),
				),
			)

			c.JSON(
				http.StatusTooManyRequests,
				gin.H{
					"success": false,
					"message": "Too many requests. Please slow down.",
				},
			)

			c.Abort()
			return
		}

		c.Next()
	}
}

func (limiter *RateLimiter) keyForRequest(
	c *gin.Context,
	group string,
	identity IdentityType,
	appDB *sql.DB,
) string {
	switch identity {
	case IdentityUser, IdentityAdmin:
		if appDB != nil {
			userID, err :=
				session.LookupUserID(
					c,
					appDB,
				)

			if err == nil && userID != "" {
				return fmt.Sprintf(
					"%s:%s:%s",
					identity,
					group,
					userID,
				)
			}
		}
	}

	return fmt.Sprintf(
		"ip:%s:%s",
		group,
		clientIP(c),
	)
}

func (limiter *RateLimiter) allow(
	key string,
	maxRequests int,
	window time.Duration,
) (
	bool,
	time.Duration,
) {
	now :=
		time.Now()

	limiter.mu.Lock()
	defer limiter.mu.Unlock()

	current, ok :=
		limiter.buckets[key]

	if !ok || now.After(current.ResetAt) {
		limiter.buckets[key] =
			&bucket{
				Count:     1,
				ResetAt:   now.Add(window),
				UpdatedAt: now,
			}

		return true, 0
	}

	current.UpdatedAt =
		now

	if current.Count >= maxRequests {
		return false, time.Until(current.ResetAt)
	}

	current.Count++

	return true, 0
}

func (limiter *RateLimiter) cleanupLoop() {
	ticker :=
		time.NewTicker(5 * time.Minute)

	defer ticker.Stop()

	for range ticker.C {
		limiter.cleanup()
	}
}

func (limiter *RateLimiter) cleanup() {
	cutoff :=
		time.Now().Add(-10 * time.Minute)

	limiter.mu.Lock()
	defer limiter.mu.Unlock()

	for key, current := range limiter.buckets {
		if current.UpdatedAt.Before(cutoff) {
			delete(
				limiter.buckets,
				key,
			)
		}
	}
}

func clientIP(c *gin.Context) string {
	cfIP :=
		strings.TrimSpace(
			c.GetHeader("CF-Connecting-IP"),
		)

	if cfIP != "" {
		return cfIP
	}

	forwardedFor :=
		strings.TrimSpace(
			c.GetHeader("X-Forwarded-For"),
		)

	if forwardedFor != "" {
		parts :=
			strings.Split(
				forwardedFor,
				",",
			)

		if len(parts) > 0 {
			ip :=
				strings.TrimSpace(parts[0])

			if ip != "" {
				return ip
			}
		}
	}

	return c.ClientIP()
}
