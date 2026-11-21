package com.example.demo.controller;

import com.example.demo.model.DiningTable;
import com.example.demo.repository.DiningTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final DiningTableRepository tableRepository;

    @GetMapping
    public ResponseEntity<List<DiningTable>> getAllTables() {
        return ResponseEntity.ok(tableRepository.findAllByOrderByNumberAsc());
    }
}
