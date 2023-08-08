package com.example.tunetracker;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class EditListAdapter extends RecyclerView.Adapter<EditViewHolder>{
    Context context;
    Tune tune;
    String sort_key;
    public EditListAdapter(Context context, Tune tune) {
        this.context = context;
        this.tune = tune;
    }

    @NonNull
    @Override
    public EditViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new EditViewHolder(LayoutInflater.from(context).inflate(R.layout.string_input_view, parent, false));
    }
    @Override
    public int getItemViewType(int position){
        switch((String)MainActivity.tuneTypeMap.values().toArray()[position]){
            case "String":
                return 0;
            case "Int":
                return 1;
            case "List":
                return 2;
            default:
                return 0;
        }
    }
    public void onBindViewHolder(@NonNull EditViewHolder holder, int position) {
        holder.keyView.setText((String)MainActivity.tuneTypeMap.keySet().toArray()[position]);
    }


    @Override
    public int getItemCount() {
        return MainActivity.tuneTypeMap.size();
    }
}
