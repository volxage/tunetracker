package com.example.tunetracker;

import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

public class MyViewHolder extends RecyclerView.ViewHolder {
    TextView titleView, composersView, subtitleView;
    public MyViewHolder(@NonNull View itemView) {
        super(itemView);
        titleView = itemView.findViewById(R.id.title);
        composersView = itemView.findViewById(R.id.composers);
        subtitleView = itemView.findViewById(R.id.subtitle);
    }
}
