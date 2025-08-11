package com.tagyou.festivaltracker.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.tagyou.festivaltracker.R
import com.tagyou.festivaltracker.map.MapActivity

// Simplified messaging service for now
// TODO: Implement proper Supabase real-time messaging
class TagYouFirebaseMessagingService {
    
    companion object {
        private const val CHANNEL_ID = "tagyou_messaging"
        private const val NOTIFICATION_ID = 1002
        
        fun createNotificationChannel(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "TagYou Messages",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Notifications for friend updates and messages"
                }
                
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.createNotificationChannel(channel)
            }
        }
        
        fun showNotification(context: Context, title: String, message: String) {
            val intent = Intent(context, MapActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_IMMUTABLE
            )
            
            val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(message)
                .setSmallIcon(R.drawable.ic_group)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .build()
            
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(NOTIFICATION_ID, notification)
        }
    }
}

