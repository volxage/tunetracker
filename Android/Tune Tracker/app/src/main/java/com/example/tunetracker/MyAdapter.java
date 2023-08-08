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

public class MyAdapter extends RecyclerView.Adapter<MyViewHolder>{
    Context context;
    List<Tune> items;
    String sort_key;
    public MyAdapter(Context context, List<Tune> items) {
        this.context = context;
        this.items = items;
    }

    @NonNull
    @Override
    public MyViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new MyViewHolder(LayoutInflater.from(context).inflate(R.layout.item_view, parent, false));
    }

    @Override
    public void onBindViewHolder(@NonNull MyViewHolder holder, int position) {
        holder.titleView.setText(items.get(position).getTitle());
        holder.composersView.setText(items.get(position).getComposers());
        holder.subtitleView.setText(items.get(position).getSubtitle());
    }


    @Override
    public int getItemCount() {
        return items.size();
    }
    public void sort(String sort_key) {
        this.sort_key = sort_key;
        String class_str = MainActivity.tuneTypeMap.get(sort_key);
        if(class_str == "String") {
            Collections.sort(items, new Comparator<Tune>() {
                @Override
                public int compare(Tune t1, Tune t2) {
                    return t1.get_str(sort_key).compareToIgnoreCase(t2.get_str(sort_key));
                }
            });
            if(!sort_key.equals("title")) {
                for (Tune t : items) {
                    t.setSubtitle(t.get_str(sort_key));
                }
            }
        }
        else if(class_str.equals("int")){
            Collections.sort(items, new Comparator<Tune>() {
                @Override
                public int compare(Tune t1, Tune t2){
                    return t1.get_int(sort_key) - t2.get_int(sort_key);
                }
            });
            for (Tune t : items) {
                t.setSubtitle(Integer.toString(t.get_int(sort_key)));
            }
        }
        else if(class_str.equals("List")) {
            Collections.sort(items, new Comparator<Tune>() {
                @Override
                public int compare(Tune t1, Tune t2) {
                    return t1.get_first(sort_key).compareToIgnoreCase(t2.get_first(sort_key));
                }
            });
            if(sort_key != "composers") {
                for (Tune t : items) {
                    ArrayList<String> al = (ArrayList)t.map.get(sort_key);
                    if(al != null) {
                        t.setSubtitle(String.join(", ", al));
                    }else{
                        t.setSubtitle("None provided");
                    }
                }
            }
        }
        notifyDataSetChanged();

    }
}
