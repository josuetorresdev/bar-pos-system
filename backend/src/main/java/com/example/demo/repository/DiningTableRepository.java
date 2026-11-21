package com.example.demo.repository;

import com.example.demo.model.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {
    List<DiningTable> findAllByOrderByNumberAsc();
}
