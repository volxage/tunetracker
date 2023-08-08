package com.example.tunetracker;

import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

public class EditViewHolder extends RecyclerView.ViewHolder {
    TextView keyView;
    View editView;
    public EditViewHolder(@NonNull View itemView) {
        super(itemView);
        keyView = itemView.findViewById(R.id.keylabel);
        editView = itemView.findViewById(R.id.valinput);
    }
}
