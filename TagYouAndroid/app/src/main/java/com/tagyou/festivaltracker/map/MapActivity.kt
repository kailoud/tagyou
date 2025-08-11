package com.tagyou.festivaltracker.map

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.lifecycle.ViewModelProvider
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.google.firebase.auth.FirebaseAuth
import com.tagyou.festivaltracker.R
import com.tagyou.festivaltracker.databinding.ActivityMapBinding
import com.tagyou.festivaltracker.services.LocationTrackingService

class MapActivity : AppCompatActivity(), OnMapReadyCallback {
    
    private lateinit var binding: ActivityMapBinding
    private lateinit var viewModel: MapViewModel
    private lateinit var map: GoogleMap
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var auth: FirebaseAuth
    
    private var currentLocationMarker: Marker? = null
    private val friendMarkers = mutableMapOf<String, Marker>()
    
    private val locationPermissionRequest = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        when {
            permissions.getOrDefault(Manifest.permission.ACCESS_FINE_LOCATION, false) -> {
                // Precise location access granted
                setupLocationTracking()
            }
            permissions.getOrDefault(Manifest.permission.ACCESS_COARSE_LOCATION, false) -> {
                // Approximate location access granted
                setupLocationTracking()
            }
            else -> {
                // No location access granted
                Toast.makeText(this, R.string.location_permission_denied, Toast.LENGTH_LONG).show()
            }
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMapBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize services
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        auth = FirebaseAuth.getInstance()
        
        // Initialize ViewModel
        viewModel = ViewModelProvider(this)[MapViewModel::class.java]
        
        // Setup map
        setupMap()
        
        // Setup UI
        setupUI()
        
        // Observe data
        observeData()
        
        // Check permissions
        checkLocationPermissions()
    }
    
    private fun setupMap() {
        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)
    }
    
    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap
        
        // Configure map settings
        map.uiSettings.apply {
            isZoomControlsEnabled = true
            isMyLocationButtonEnabled = true
            isCompassEnabled = true
        }
        
        // Set map style
        map.mapType = GoogleMap.MAP_TYPE_NORMAL
        
        // Setup map click listeners
        setupMapListeners()
        
        // Start location tracking if permission granted
        if (hasLocationPermission()) {
            setupLocationTracking()
        }
    }
    
    private fun setupMapListeners() {
        map.setOnMarkerClickListener { marker ->
            // Handle marker clicks
            val friendId = marker.tag as? String
            if (friendId != null) {
                showFriendInfo(friendId)
            }
            true
        }
        
        map.setOnMapClickListener { latLng ->
            // Handle map clicks
            hideFriendInfo()
        }
    }
    
    private fun setupUI() {
        // My Location Button
        binding.btnMyLocation.setOnClickListener {
            moveToCurrentLocation()
        }
        
        // Center on Group Button
        binding.btnCenterGroup.setOnClickListener {
            centerOnGroup()
        }
        
        // Show/Hide Friends Button
        binding.btnToggleFriends.setOnClickListener {
            toggleFriendsVisibility()
        }
        
        // Show Food Stalls Button
        binding.btnShowFoodStalls.setOnClickListener {
            toggleFoodStalls()
        }
        
        // Show Float Trucks Button
        binding.btnShowFloatTrucks.setOnClickListener {
            toggleFloatTrucks()
        }
        
        // Settings Button
        binding.btnSettings.setOnClickListener {
            // TODO: Open settings
        }
    }
    
    private fun observeData() {
        // Observe current location
        viewModel.currentLocation.observe(this) { location ->
            location?.let { updateCurrentLocationMarker(it) }
        }
        
        // Observe friends locations
        viewModel.friendsLocations.observe(this) { friends ->
            updateFriendMarkers(friends)
        }
        
        // Observe food stalls
        viewModel.foodStalls.observe(this) { stalls ->
            // TODO: Add food stall markers
        }
        
        // Observe float trucks
        viewModel.floatTrucks.observe(this) { trucks ->
            // TODO: Add float truck markers
        }
        
        // Observe tracking status
        viewModel.isTracking.observe(this) { isTracking ->
            updateTrackingUI(isTracking)
        }
    }
    
    private fun checkLocationPermissions() {
        if (!hasLocationPermission()) {
            requestLocationPermissions()
        } else {
            setupLocationTracking()
        }
    }
    
    private fun hasLocationPermission(): Boolean {
        return ActivityCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED ||
        ActivityCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    private fun requestLocationPermissions() {
        locationPermissionRequest.launch(
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
        )
    }
    
    private fun setupLocationTracking() {
        if (!hasLocationPermission()) return
        
        // Enable my location on map
        try {
            map.isMyLocationEnabled = true
        } catch (e: SecurityException) {
            // Handle security exception
        }
        
        // Start location tracking service
        startLocationTrackingService()
        
        // Get current location
        getCurrentLocation()
    }
    
    private fun startLocationTrackingService() {
        val intent = Intent(this, LocationTrackingService::class.java)
        startForegroundService(intent)
    }
    
    private fun getCurrentLocation() {
        if (!hasLocationPermission()) return
        
        try {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                location?.let {
                    viewModel.updateCurrentLocation(it)
                    moveToCurrentLocation()
                }
            }
        } catch (e: SecurityException) {
            // Handle security exception
        }
    }
    
    private fun updateCurrentLocationMarker(location: Location) {
        val latLng = LatLng(location.latitude, location.longitude)
        
        if (currentLocationMarker == null) {
            currentLocationMarker = map.addMarker(
                MarkerOptions()
                    .position(latLng)
                    .title("My Location")
                    .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_BLUE))
            )
        } else {
            currentLocationMarker?.position = latLng
        }
    }
    
    private fun updateFriendMarkers(friends: List<FriendLocation>) {
        // Remove old markers
        friendMarkers.values.forEach { marker: Marker -> marker.remove() }
        friendMarkers.clear()
        
        // Add new markers
        friends.forEach { friend ->
            val marker = map.addMarker(
                MarkerOptions()
                    .position(LatLng(friend.latitude, friend.longitude))
                    .title(friend.displayName)
                    .snippet("Last updated: ${friend.lastUpdated}")
                    .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN))
            )
            
            marker?.let { safeMarker ->
                safeMarker.tag = friend.userId
                friendMarkers[friend.userId] = safeMarker
            }
        }
    }
    
    private fun moveToCurrentLocation() {
        viewModel.currentLocation.value?.let { location ->
            val latLng = LatLng(location.latitude, location.longitude)
            map.animateCamera(
                CameraUpdateFactory.newLatLngZoom(latLng, 15f)
            )
        }
    }
    
    private fun centerOnGroup() {
        // TODO: Center on group members
        Toast.makeText(this, "Centering on group...", Toast.LENGTH_SHORT).show()
    }
    
    private fun toggleFriendsVisibility() {
        val isVisible = friendMarkers.values.any { it.isVisible }
        friendMarkers.values.forEach { it.isVisible = !isVisible }
        
        binding.btnToggleFriends.text = if (isVisible) {
            getString(R.string.show_friends)
        } else {
            getString(R.string.hide_friends)
        }
    }
    
    private fun toggleFoodStalls() {
        // TODO: Toggle food stall markers
        Toast.makeText(this, "Toggling food stalls...", Toast.LENGTH_SHORT).show()
    }
    
    private fun toggleFloatTrucks() {
        // TODO: Toggle float truck markers
        Toast.makeText(this, "Toggling float trucks...", Toast.LENGTH_SHORT).show()
    }
    
    private fun showFriendInfo(friendId: String) {
        // TODO: Show friend info dialog
        Toast.makeText(this, "Showing friend info...", Toast.LENGTH_SHORT).show()
    }
    
    private fun hideFriendInfo() {
        // TODO: Hide friend info dialog
    }
    
    private fun updateTrackingUI(isTracking: Boolean) {
        binding.btnMyLocation.isEnabled = isTracking
        binding.btnCenterGroup.isEnabled = isTracking
        binding.btnToggleFriends.isEnabled = isTracking
        
        if (isTracking) {
            binding.tvStatus.text = "Tracking active"
            binding.tvStatus.setTextColor(getColor(R.color.success))
        } else {
            binding.tvStatus.text = "Tracking inactive"
            binding.tvStatus.setTextColor(getColor(R.color.error))
        }
    }
    
    override fun onResume() {
        super.onResume()
        if (hasLocationPermission()) {
            setupLocationTracking()
        }
    }
    
    override fun onPause() {
        super.onPause()
        // Location tracking service continues in background
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // Stop location tracking service if app is completely closed
        // For now, keep it running for background tracking
    }
}

data class FriendLocation(
    val userId: String,
    val displayName: String,
    val latitude: Double,
    val longitude: Double,
    val lastUpdated: String
)

