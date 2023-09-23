package com.example.tunetracker;

import android.content.Context;
import android.text.Layout;
import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

public class EditListAdapter extends RecyclerView.Adapter<EditViewHolder>{
    Context context;
    Map<String, Object> tune_map;
    String sort_key;
    public EditListAdapter(Context context, Map<String, Object> tune) {
        this.context = context;
        this.tune_map = tune;
    }

    @NonNull
    @Override
    public EditViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new EditViewHolder(LayoutInflater.from(context).inflate(viewType, parent, false));
    }
    @Override
    public int getItemViewType(int position){
        String key = (String)MainActivity.tuneTypeMap.values().toArray()[position];
        switch(key){
            case "int":
                return R.layout.int_input_view;
            case "List":
                return R.layout.list_input_view;
            default:
                return R.layout.string_input_view;
        }
    }
    public void onBindViewHolder(@NonNull EditViewHolder holder, int position) {
        String key = (String)MainActivity.tuneTypeMap.keySet().toArray()[position];
        holder.keyView.setText(key);
        String val_type = (String)MainActivity.tuneTypeMap.values().toArray()[position];
        if(tune_map.containsKey(key)) {
            switch (val_type) {
                case "int":
                    holder.setInt((int) tune_map.get(key));
                    break;
                case "List":
                    holder.setList((List) tune_map.get(key));
                    break;
                default:
                    holder.setString((String) tune_map.get(key));
            }
        }
    }


    @Override
    public int getItemCount() {
        return MainActivity.tuneTypeMap.size();
    }
}
